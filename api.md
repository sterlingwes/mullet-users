# Users

User / auth tools.


****

## Verify session event

Emitted by routes that use server.forceAuth middleware, acts like middleware
CALL NEXT() to allow passthru

- Checks whether currentSession is set on request (from serverBoot sessionState)
- If set, tries to find user by [id] and token [key]
- If found, authorized. If not, unauthorized.