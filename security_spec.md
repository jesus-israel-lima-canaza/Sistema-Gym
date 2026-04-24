# Firestore Security Specification - Titan Gym Management

## Data Invariants
1. A Member must have a valid Plan ID from the established plans.
2. Payments must be linked to a valid Member.
3. Users (Staff) must have a profile with a defined role ('admin' or 'cashier').
4. Only admins can modify Plans, Expenses, and Inventory stock (except for cashier sales which decrement stock).
5. All timestamps must be validated against `request.time`.

## The "Dirty Dozen" Payloads (Anti-Patterns)
1. **Identity Theft**: Attempting to create a profile for another UID.
2. **Role Escalation**: Attempting to set `role: 'admin'` as a cashier.
3. **Ghost Payments**: Creating a payment without an existing member.
4. **Infinite Stock**: Setting inventory price to 0 or negative.
5. **Backdated Check-in**: Setting a check-in timestamp in the past.
6. **Negative Ages**: Registering a member with `age: -5`.
7. **Bypass Rules**: Accessing `/expenses` as a cashier (list/get).
8. **Plan Tampering**: Changing the price of a plan as a non-admin.
9. **Fake Membership**: Setting `status: 'active'` without a payment.
10. **Orphaned Records**: Deleting a plan that is still in use by members.
11. **Spoofed User**: Using an unverified email to gain admin access.
12. **Mass Scrape**: Attempting a `list` query on `/members` without being authenticated.

## The Test Runner
Tests will verify that these malicious payloads are rejected.
(Note: Real tests would be in `firestore.rules.test.ts`)
