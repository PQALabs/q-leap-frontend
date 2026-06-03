# Security Audits

> **Last updated:** 2026-06-02

This directory stores all security audit reports, preliminary findings, and accepted risk decisions for the Q-LEAP protocol.

---

## Audit History

| Date | Scope | Provider | Status | Report |
|------|-------|----------|--------|--------|
| — | Smart contracts (initial) | TBD | Not yet conducted | — |
| — | Frontend security review | TBD | Not yet conducted | — |

No formal third-party security audit has been conducted as of this writing.

---

## Known Risks (Accepted)

These are architectural risks that the team is aware of and has consciously deferred:

| Risk | Impact | Mitigation Plan |
|------|--------|-----------------|
| JWT stored in localStorage | XSS can steal session | Migrate to HttpOnly cookie before full Mainnet launch |
| Single-key LendingPool admin | Single point of failure for protocol | Migrate to 2-of-3 Safe multisig |
| No formal smart contract audit | Undiscovered vulnerabilities | Commission audit before significant TVL |
| Trivy scan disabled in CI | CVEs may go undetected in Docker image | Re-enable after fixing `picomatch` CVE-2026-33671 |

---

## File Naming Convention

When adding audit reports, use this format:

```
SECURITY_AUDITS/
├── YYYY-MM_provider_scope_preliminary.pdf
├── YYYY-MM_provider_scope_final.pdf
└── YYYY-MM_internal_review_notes.md
```

Example:
```
SECURITY_AUDITS/
├── 2026-08_certik_smart-contracts_preliminary.pdf
└── 2026-09_certik_smart-contracts_final.pdf
```

---

## Pre-Audit Checklist

Before commissioning an audit, ensure the following are in place:

- [ ] All smart contract source code is verified on the block explorer
- [ ] NatSpec documentation is complete on all public/external functions
- [ ] Unit and integration test coverage > 80% on critical paths
- [ ] A private disclosure channel is established with the audit firm
- [ ] An incident response runbook is prepared (see `DEPLOYMENT.md`)
