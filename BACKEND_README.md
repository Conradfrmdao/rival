# Rival Backend API Documentation

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL (via Supabase)
- Environment variables configured

### Environment Variables
Create a `.env.local` file in the root directory:

```env
# Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret

# API
API_PORT=3001
FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:3001

# Payment (pawaPay simulation)
PAWAPAY_API_KEY=your_pawapay_key
PAWAPAY_SECRET=your_pawapay_secret
PAWAPAY_WEBHOOK_SECRET=your_webhook_secret

# SMS Gateway (Simulation)
SMS_GATEWAY_API_KEY=your_sms_gateway_key
SMS_GATEWAY_SECRET=your_sms_gateway_secret

# Agora (Voice Chat)
AGORA_APP_ID=your_agora_app_id
AGORA_APP_CERTIFICATE=your_agora_certificate

# Environment
NODE_ENV=development
```

### Running the Backend

```bash
# Install dependencies
npm install

# Start development server
npm run server:dev

# Build for production
npm run server:build

# Start production server
npm run server:start

# Run both frontend and backend
npm run fullstack
```

## 📡 API Endpoints

### Authentication

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "username": "string",
  "phone": "string",
  "password": "string",
  "referralCode": "string (optional)"
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "phone": "string",
  "password": "string"
}
```

#### Refresh Token
```
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "string"
}
```

#### Get User Profile
```
GET /api/auth/profile
Authorization: Bearer {accessToken}
```

#### Change Password
```
POST /api/auth/change-password
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "currentPassword": "string",
  "newPassword": "string"
}
```

#### Logout
```
POST /api/auth/logout
Authorization: Bearer {accessToken}
```

### Wallet Management

#### Get Balance
```
GET /api/wallet/balance
Authorization: Bearer {accessToken}
```

#### Initiate Deposit
```
POST /api/wallet/deposit
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "amount": "number (min: 1000)",
  "phone": "string"
}
```

#### Initiate Withdrawal
```
POST /api/wallet/withdraw
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "amount": "number (min: 1000)",
  "phone": "string"
}
```

#### Get Transaction History
```
GET /api/wallet/transactions
Authorization: Bearer {accessToken}
Query Parameters:
- page: number (default: 1)
- limit: number (default: 20)
- type: "deposit" | "withdrawal" | "game_win" | "game_loss" | "fee" | "bonus"
- status: "pending" | "completed" | "failed" | "cancelled"
- startDate: string (ISO datetime)
- endDate: string (ISO datetime)
```

### Games

#### Get Available Games
```
GET /api/games
Authorization: Bearer {accessToken}
```

### Matchmaking & Matches

#### Join Matchmaking / Create Match
```
POST /api/matches
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "action": "join_matchmaking",
  "gameType": "rock_paper_scissors" | "tic_tac_toe" | "ball_in_cup" | "penalty_take",
  "stakeAmount": "number (min: 500)"
}
```

#### Leave Matchmaking
```
POST /api/matches
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "action": "leave_matchmaking"
}
```

#### Get Match History
```
GET /api/matches
Authorization: Bearer {accessToken}
Query Parameters:
- page: number (default: 1)
- limit: number (default: 20)
- status: "matchmaking" | "active" | "completed" | "cancelled"
- gameType: "rock_paper_scissors" | "tic_tac_toe" | "ball_in_cup" | "penalty_take"
```

### Game Moves

#### Make Game Move
```
POST /api/moves
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "matchId": "string (UUID)",
  "gameType": "string",
  "move": "any (validated per game)",
  "action": "make_move"
}
```

#### Get Game State
```
POST /api/moves
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "matchId": "string (UUID)",
  "gameType": "string",
  "action": "get_game_state"
}
```

### Game Results

#### Submit Game Result
```
POST /api/matches/{matchId}/result
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "result": "win" | "lose" | "draw",
  "gameData": "any (optional)",
  "winnerId": "string (UUID, optional)",
  "details": "any (optional)"
}
```

### Webhooks

#### Deposit Webhook (pawaPay)
```
POST /api/wallet/webhook/deposit
Headers:
- X-Webhook-Signature: SHA256 HMAC

Body: varies by payment provider
```

## 🔌 WebSocket Events

### Connection
```javascript
import io from 'socket.io-client';

const socket = io('ws://localhost:3001', {
  auth: {
    token: 'your_jwt_access_token'
  }
});
```

### Events

#### Join Match
```javascript
socket.emit('join_match', { matchId: 'uuid' });
```

#### Game Move
```javascript
socket.emit('game_move', {
  matchId: 'uuid',
  move: 'rock', // varies by game
  action: 'make_move'
});
```

#### Voice Chat
```javascript
socket.emit('voice_chat', {
  matchId: 'uuid',
  action: 'join_channel',
  payload: { channelName: 'string' }
});
```

#### Send Chat Message
```javascript
socket.emit('chat_message', {
  matchId: 'uuid',
  message: 'Hello!'
});
```

#### Listen to Events
```javascript
socket.on('game_state', (data) => {
  console.log('Game state updated:', data);
});

socket.on('opponent_move', (data) => {
  console.log('Opponent made a move:', data);
});

socket.on('player_joined', (data) => {
  console.log('Player joined match:', data);
});

socket.on('chat_message', (data) => {
  console.log('New chat message:', data);
});
```

## 🎮 Game-Specific Move Formats

### Rock Paper Scissors
```json
{
  "move": "rock" | "paper" | "scissors"
}
```

### Tic Tac Toe
```json
{
  "move": {
    "position": 0 // 0-8 (3x3 grid)
  }
}
```

### Ball in Cup
```json
{
  "move": 1 // 0, 1, or 2 (cup index)
}
```

### Penalty Take
```json
{
  "move": {
    "position": 4, // 0-8 (3x3 grid)
    "power": 75    // 0-100 (shot power)
  }
}
```

## 🧪 Testing

### Run API Tests
```bash
# Make sure the server is running first
npm run server:dev

# In another terminal, run the tests
npm run test:api

# Or build and test
npm run test:server
```

### Test Coverage
The test suite covers:
- ✅ Health check endpoint
- ✅ User registration and login
- ✅ Token refresh
- ✅ Wallet operations (balance, deposit, withdrawal)
- ✅ Games retrieval
- ✅ Matchmaking system
- ✅ Game moves
- ✅ Game result processing
- ✅ User profile management

## 📝 Database Schema

### Tables
- `users` - User profiles and authentication
- `wallets` - User balances and transactions
- `games` - Available game types and configurations
- `matches` - Game matches and their states
- `transactions` - Financial transaction records
- `game_sessions` - Player participation tracking

### Key Features
- Row-Level Security (RLS) policies
- Automatic winnings processing via database functions
- Transaction logging with audit trails
- User activity tracking

## 🛡️ Security Features

- JWT-based authentication with access/refresh tokens
- Password hashing with bcrypt
- Input validation with Zod schemas
- Rate limiting on API endpoints
- CORS configuration
- Security headers with Helmet
- Request logging and monitoring
- SQL injection prevention via parameterized queries

## 🔧 Monitoring & Logging

- Structured logging with timestamps and request IDs
- Error tracking with stack traces in development
- Request/response logging
- Performance metrics
- WebSocket connection monitoring

## 📱 Mobile Money Integration

### pawaPay Integration (Simulation)
- Deposit initiation with phone verification
- Webhook-based payment confirmation
- Transaction status tracking
- Automatic wallet balance updates

### Supported Countries
- Uganda (UGX)
- Kenya (KES)
- Tanzania (TZS)
- Rwanda (RWF)

## 🎤 Voice Chat

### Agora Integration
- Real-time voice communication during matches
- Automatic channel creation per match
- Secure token generation
- WebRTC-based audio streaming

## 📈 Performance Features

- Database connection pooling
- Redis caching (optional)
- Image optimization
- CDN support
- Compression middleware
- Static asset serving

## 🚀 Deployment

### Environment Setup
1. Configure Supabase database
2. Set up environment variables
3. Build the application
4. Start the server

### Production Considerations
- Use HTTPS
- Configure proper CORS origins
- Set up monitoring
- Configure backup strategies
- Use managed PostgreSQL if possible

## 🤝 API Rate Limits

- General API: 100 requests per 15 minutes per IP
- Authentication: 10 requests per minute per IP
- Wallet operations: 20 requests per minute per user
- Game moves: 60 requests per minute per user

## 📞 Support

For API support and questions:
- Check the error responses for detailed information
- Review the logs for debugging
- Ensure all environment variables are properly configured
- Verify database connections and migrations

---

Built with ❤️ for Uganda's gaming community