# Referral System API Documentation

## Overview
The referral system allows users to earn bonuses by sharing their referral links with others. When someone registers using a referral link, both the referrer and the new user can receive bonuses.

## API Endpoints

### 1. Create User with Referral
Registers a new user and handles referral bonuses automatically.

**Endpoint:** `POST /api/users`
**Description:** Creates a new user account. If the user was referred by another user, the referrer receives a bonus.

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "referred_by": "string (optional)" // User ID of the referrer
}
```

**Response:**
```json
{
  "id": "string",
  "username": "string",
  "email": "string",
  "balance": "number",
  "referred_by": "string (optional)"
}
```

### 2. Grant Referral Bonus
Manually grants a referral bonus to a user.

**Endpoint:** `POST /api/referral-bonus`
**Description:** Grants a referral bonus to a user for bringing in a new user.

**Request Body:**
```json
{
  "user_id": "string",          // ID of the referrer
  "referred_user_id": "string"  // ID of the referred user
}
```

**Response:**
```json
{
  "success": "boolean",
  "message": "string",
  "bonus_amount": "number"
}
```

## How It Works

1. **Referral Link Generation:** 
   - Users can generate their referral link from their dashboard
   - The link format is: `https://yourdomain.com/register?ref=USER_ID`

2. **Registration with Referral:**
   - When a new user registers using a referral link, the `referred_by` field is set to the referrer's user ID
   - The referrer automatically receives a Rs. 500 bonus

3. **Bonus Distribution:**
   - Referral bonuses are automatically processed when a referred user completes registration
   - Each referral earns the referrer Rs. 500
   - Bonuses are added to the referrer's account balance
   - Transactions are recorded in the transaction history

## Frontend Integration

### Generating Referral Links
```javascript
const referralLink = `${window.location.origin}/register?ref=${userId}`;
```

### Copying Referral Link to Clipboard
```javascript
navigator.clipboard.writeText(referralLink);
```

## Terms & Conditions

1. Each successful referral earns the referrer Rs. 500
2. Referral bonuses are credited after the referred user completes registration
3. There is no limit on the number of referrals a user can make
4. WinShow reserves the right to modify or terminate the referral program at any time
5. Fraudulent activities will result in account suspension and forfeiture of bonuses