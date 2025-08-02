# Security Policy

## Supported Versions

Use this section to tell people about which versions of your project are currently being supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of Canopy Copilot seriously. If you believe you have found a security vulnerability, please report it to us as described below.

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to `security@canopycopilot.com`.

You should receive a response within 48 hours. If for some reason you do not, please follow up via email to ensure we received your original message.

Please include the requested information listed below (as much as you can provide) to help us better understand the nature and scope of the possible issue:

- Type of issue (buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the vulnerability
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

This information will help us triage your report more quickly.

## Security Best Practices

### For Developers

1. **Keep dependencies updated**: Regularly update all dependencies to their latest secure versions
2. **Use security scanning**: Run `make security-check-full` before deploying
3. **Follow secure coding practices**: Use the provided linting and security tools
4. **Validate all inputs**: Always validate and sanitize user inputs
5. **Use HTTPS**: Always use HTTPS in production environments
6. **Implement proper authentication**: Use secure authentication mechanisms
7. **Log security events**: Monitor and log security-related events

### For Users

1. **Keep the application updated**: Always use the latest stable version
2. **Secure your API keys**: Never commit API keys to version control
3. **Use strong passwords**: Use strong, unique passwords for all accounts
4. **Enable 2FA**: Enable two-factor authentication where available
5. **Monitor logs**: Regularly check application logs for suspicious activity

## Security Tools

This project includes several security tools:

- **Bandit**: Static security analysis for Python code
- **Safety**: Checks for known security vulnerabilities in Python dependencies
- **npm audit**: Checks for known security vulnerabilities in Node.js dependencies
- **Pre-commit hooks**: Automatically run security checks before commits

Run security checks with:

```bash
make security-check-full
make security-scan
```

## Disclosure Policy

When we receive a security bug report, we will:

1. Confirm the problem and determine the affected versions
2. Audit code to find any similar problems
3. Prepare fixes for all supported versions
4. Release new versions with the fixes
5. Publicly announce the vulnerability and the fix

## Credits

We would like to thank all security researchers and contributors who help us maintain the security of Canopy Copilot by responsibly reporting vulnerabilities.
