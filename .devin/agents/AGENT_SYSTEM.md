# Multi-Agent System Architecture

## Overview
Distributed development workflow with specialized agents for quality assurance, development, research, version control, and documentation.

## Agent Roles & Responsibilities

### 1. QA Audit Agent (CRITICAL)
**Profile**: `subagent_general`  
**Responsibility**: Validate all code changes in sandbox before production deployment

**Tasks**:
- Run linting and type checking
- Execute test suites
- Verify build succeeds
- Check for security issues
- Validate data integrity
- Performance testing
- Accessibility compliance
- Cross-browser compatibility

**Output**: QA Report with pass/fail status and blockers

**Deployment Gate**: Code cannot go to production without QA approval

---

### 2. Frontend Development Agent
**Profile**: `subagent_general`  
**Responsibility**: UI/UX implementation and component development

**Tasks**:
- Build React components
- Implement styling (Tailwind CSS)
- Handle client-side state management
- Optimize performance
- Ensure responsive design
- Accessibility implementation

**Deliverables**: 
- Component code
- Storybook stories (if applicable)
- Performance metrics

---

### 3. Backend Development Agent
**Profile**: `subagent_general`  
**Responsibility**: API routes, data processing, and server logic

**Tasks**:
- Implement API endpoints
- Database queries and migrations
- Business logic
- Error handling
- Rate limiting and security
- Caching strategies

**Deliverables**:
- API code
- Database schemas
- Integration tests

---

### 4. Research & Validation Agent
**Profile**: `subagent_explore`  
**Responsibility**: Verify ground truth and validate data sources

**Tasks**:
- Verify datasheet URLs are accessible
- Extract and validate specs from official sources
- Cross-reference competitor data
- Check pricing accuracy
- Validate manufacturer information
- Identify data gaps and inconsistencies

**Output**: 
- Data Validation Report
- Source Documentation
- Flagged Issues

**Critical for**: Pricing data, product specs, competitor analysis

---

### 5. Version Control & Tracker Agent
**Profile**: `subagent_general`  
**Responsibility**: Track all changes, maintain rollback capability

**Tasks**:
- Create detailed git commits with context
- Maintain changelog
- Track breaking changes
- Create rollback snapshots
- Document dependency updates
- Monitor for conflicts

**Deliverables**:
- Commit history with rationale
- Rollback guide
- Change summary

---

### 6. Documentation Agent
**Profile**: `subagent_general`  
**Responsibility**: Document all changes, architecture, and processes

**Tasks**:
- Update README files
- Document API endpoints
- Create architecture diagrams
- Update AGENTS.md
- Document data sources
- Create user guides
- Maintain changelog

**Deliverables**:
- Updated documentation
- API documentation
- Architecture diagrams
- User guides

---

## Workflow Process

### Standard Development Workflow

```
1. RESEARCH AGENT
   ├─ Validate ground truth
   ├─ Verify data sources
   └─ Output: Validation Report

2. FRONTEND + BACKEND AGENTS (Parallel)
   ├─ Frontend Agent: Build UI components
   ├─ Backend Agent: Implement APIs
   └─ Output: Code changes

3. QA AUDIT AGENT (CRITICAL GATE)
   ├─ Run all tests
   ├─ Check code quality
   ├─ Verify data integrity
   ├─ Security scan
   └─ Output: QA Report
   
   IF QA FAILS:
   └─ Return to Dev Agents for fixes
   
   IF QA PASSES:
   └─ Continue to next step

4. VERSION CONTROL AGENT
   ├─ Create detailed commits
   ├─ Update changelog
   ├─ Create rollback snapshot
   └─ Output: Commit history

5. DOCUMENTATION AGENT
   ├─ Update all documentation
   ├─ Document changes
   ├─ Update API docs
   └─ Output: Updated docs

6. DEPLOYMENT
   └─ Push to production (only after all agents complete)
```

---

## Agent Communication Protocol

### Input Format
Each agent receives:
```json
{
  "task": "description of work",
  "context": {
    "previous_agent": "agent_name",
    "validation_report": "if applicable",
    "files_to_modify": ["file1", "file2"],
    "acceptance_criteria": ["criterion1", "criterion2"]
  },
  "constraints": {
    "no_breaking_changes": true,
    "maintain_backward_compatibility": true
  }
}
```

### Output Format
Each agent returns:
```json
{
  "agent": "agent_name",
  "status": "success|failure|blocked",
  "summary": "brief summary",
  "details": "detailed findings",
  "blockers": ["blocker1", "blocker2"],
  "next_agent": "agent_name",
  "artifacts": {
    "code_changes": [],
    "test_results": {},
    "reports": []
  }
}
```

---

## QA Audit Checklist

### Code Quality
- [ ] No linting errors
- [ ] TypeScript strict mode passes
- [ ] No console errors/warnings
- [ ] Code follows project conventions

### Testing
- [ ] All unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass (if applicable)
- [ ] New code has test coverage >80%

### Data Integrity
- [ ] No data loss
- [ ] Database migrations valid
- [ ] API responses match schema
- [ ] No SQL injection vulnerabilities

### Performance
- [ ] Build time acceptable
- [ ] Bundle size not increased >5%
- [ ] API response times <500ms
- [ ] No memory leaks

### Security
- [ ] No hardcoded secrets
- [ ] CORS properly configured
- [ ] Input validation present
- [ ] No XSS vulnerabilities

### Accessibility
- [ ] WCAG 2.1 AA compliant
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast adequate

---

## Rollback Procedure

If QA fails or production issue found:

1. **Version Control Agent** provides rollback snapshot
2. **QA Agent** verifies rollback integrity
3. **Documentation Agent** updates incident log
4. **Dev Agents** fix issues
5. **QA Agent** re-validates
6. **Deployment** proceeds

---

## Agent Escalation

### When to Escalate to User
- QA blocks deployment (critical issues)
- Data validation finds inconsistencies
- Breaking changes required
- Architecture decisions needed
- Security concerns

### Escalation Format
```
ESCALATION REQUIRED
Agent: [agent_name]
Severity: [critical|high|medium|low]
Issue: [description]
Recommendation: [action]
User Input Needed: [yes/no]
```

---

## Success Metrics

- **Code Quality**: 0 critical issues before deployment
- **Test Coverage**: >80% for new code
- **Documentation**: 100% of changes documented
- **Data Accuracy**: 100% of sources verified
- **Deployment Success**: 0 rollbacks in production
- **Cycle Time**: <4 hours from task to deployment

---

## Tools & Integration

### QA Agent Tools
- ESLint, Prettier
- TypeScript compiler
- Jest (unit tests)
- Cypress (E2E tests)
- OWASP ZAP (security)
- Lighthouse (performance)

### Research Agent Tools
- Web scraping (for datasheets)
- PDF extraction
- Data validation libraries
- Cross-reference tools

### Version Control Agent Tools
- Git (commits, tags, branches)
- Changelog generator
- Diff analyzer

### Documentation Agent Tools
- Markdown generation
- Diagram creation
- API documentation generators
- Changelog templates

---

## Implementation Status

- [ ] QA Audit Agent configured
- [ ] Frontend Dev Agent configured
- [ ] Backend Dev Agent configured
- [ ] Research & Validation Agent configured
- [ ] Version Control Agent configured
- [ ] Documentation Agent configured
- [ ] Workflow automation in place
- [ ] Escalation procedures defined

---

**Last Updated**: 2025-07-10  
**Version**: 1.0  
**Maintained By**: Devin AI Agent System
