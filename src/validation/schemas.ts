import { z } from 'zod';

// Common schemas
const uuidSchema = z.string().uuid('Invalid ID format');
const phoneSchema = z.string().min(10, 'Phone number must be at least 10 digits');
const usernameSchema = z.string().min(3, 'Username must be at least 3 characters').max(30, 'Username too long');
const passwordSchema = z.string().min(8, 'Password must be at least 8 characters');

// Pagination schema
const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// Authentication schemas
export const registerSchema = z.object({
  username: usernameSchema,
  phone: phoneSchema,
  password: passwordSchema,
  referralCode: z.string().optional()
});

export const loginSchema = z.object({
  phone: phoneSchema,
  password: z.string().min(1, 'Password required')
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token required')
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password required'),
  newPassword: passwordSchema
});

export const forgotPasswordSchema = z.object({
  phone: phoneSchema
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token required'),
  newPassword: passwordSchema
});

// Wallet schemas
export const depositSchema = z.object({
  amount: z.number().min(1000, 'Minimum deposit is UGX 1,000'),
  phone: phoneSchema
});

export const withdrawSchema = z.object({
  amount: z.number().min(1000, 'Minimum withdrawal is UGX 1,000'),
  phone: phoneSchema
});

export const getBalanceSchema = z.object({}).optional();

export const getTransactionsSchema = paginationSchema.extend({
  type: z.enum(['deposit', 'withdrawal', 'game_win', 'game_loss', 'fee', 'bonus']).optional(),
  status: z.enum(['pending', 'completed', 'failed', 'cancelled']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional()
});

// Game schemas
export const createMatchSchema = z.object({
  action: z.enum(['join_matchmaking']),
  gameType: z.enum(['rock_paper_scissors', 'tic_tac_toe', 'ball_in_cup', 'penalty_take']),
  stakeAmount: z.number().min(500, 'Minimum stake is UGX 500')
});

export const leaveMatchmakingSchema = z.object({
  action: z.literal('leave_matchmaking')
});

export const getMatchesSchema = paginationSchema.extend({
  status: z.enum(['matchmaking', 'active', 'completed', 'cancelled']).optional(),
  gameType: z.enum(['rock_paper_scissors', 'tic_tac_toe', 'ball_in_cup', 'penalty_take']).optional()
});

// Game move schemas
export const gameMoveSchema = z.object({
  matchId: uuidSchema,
  gameType: z.enum(['rock_paper_scissors', 'tic_tac_toe', 'ball_in_cup', 'penalty_take']),
  move: z.any(), // Will be validated based on game type
  action: z.enum(['make_move', 'get_game_state'])
});

export const rockPaperScissorsMoveSchema = z.object({
  move: z.enum(['rock', 'paper', 'scissors'])
});

export const ticTacToeMoveSchema = z.object({
  move: z.object({
    position: z.number().int().min(0).max(8)
  })
});

export const ballInCupMoveSchema = z.object({
  move: z.number().int().min(0).max(2) // 3 cups
});

export const penaltyMoveSchema = z.object({
  move: z.object({
    position: z.number().int().min(0).max(8),
    power: z.number().min(0).max(100)
  })
});

// Game result schemas
export const gameResultSchema = z.object({
  result: z.enum(['win', 'lose', 'draw']),
  gameData: z.any().optional(),
  winnerId: uuidSchema.optional(),
  details: z.any().optional()
});

// User profile schemas
export const updateProfileSchema = z.object({
  username: usernameSchema.optional(),
  avatar: z.string().url().optional(),
  bio: z.string().max(500).optional(),
  preferences: z.object({
    notifications: z.boolean().optional(),
    sound: z.boolean().optional(),
    language: z.string().optional()
  }).optional()
});

export const getUserStatsSchema = z.object({}).optional();

export const getLeaderboardSchema = paginationSchema.extend({
  gameType: z.enum(['rock_paper_scissors', 'tic_tac_toe', 'ball_in_cup', 'penalty_take']).optional(),
  timeRange: z.enum(['daily', 'weekly', 'monthly', 'all_time']).default('all_time')
});

// Notification schemas
export const getNotificationsSchema = paginationSchema.extend({
  isRead: z.boolean().optional(),
  type: z.enum(['match_invite', 'game_result', 'payment', 'system']).optional()
});

export const markNotificationReadSchema = z.object({
  notificationId: uuidSchema
});

export const markAllNotificationsReadSchema = z.object({}).optional();

// Chat schemas
export const getChatHistorySchema = paginationSchema.extend({
  matchId: uuidSchema
});

export const sendMessageSchema = z.object({
  matchId: uuidSchema,
  message: z.string().min(1).max(500)
});

// WebSocket message schemas (for client-side validation)
export const wsJoinMatchSchema = z.object({
  matchId: uuidSchema
});

export const wsGameMoveSchema = z.object({
  matchId: uuidSchema,
  move: z.any(),
  action: z.enum(['make_move', 'get_game_state'])
});

export const wsVoiceChatSchema = z.object({
  matchId: uuidSchema,
  action: z.string(),
  payload: z.any()
});

export const wsChatMessageSchema = z.object({
  matchId: uuidSchema,
  message: z.string().min(1).max(500)
});

export const wsLeaveMatchSchema = z.object({
  matchId: uuidSchema
});

export const wsReconnectMatchSchema = z.object({
  matchId: uuidSchema
});

// Admin schemas (if needed in the future)
export const adminCreateGameSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  description: z.string().min(1),
  minStake: z.number().min(0),
  maxStake: z.number().min(0),
  isActive: z.boolean().default(true)
});

export const adminUpdateUserSchema = z.object({
  userId: uuidSchema,
  isActive: z.boolean().optional(),
  isVerified: z.boolean().optional(),
  role: z.enum(['user', 'admin', 'moderator']).optional()
});

// Utility function to validate based on game type
export function validateGameMove(gameType: string, move: any) {
  switch (gameType) {
    case 'rock_paper_scissors':
      return rockPaperScissorsMoveSchema.parse({ move });
    case 'tic_tac_toe':
      return ticTacToeMoveSchema.parse({ move });
    case 'ball_in_cup':
      return ballInCupMoveSchema.parse({ move });
    case 'penalty_take':
      return penaltyMoveSchema.parse({ move });
    default:
      throw new Error(`Unknown game type: ${gameType}`);
  }
}

// Export all schemas for easy importing
export const schemas = {
  // Auth
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,

  // Wallet
  depositSchema,
  withdrawSchema,
  getBalanceSchema,
  getTransactionsSchema,

  // Games
  createMatchSchema,
  leaveMatchmakingSchema,
  getMatchesSchema,
  gameMoveSchema,
  gameResultSchema,

  // User
  updateProfileSchema,
  getUserStatsSchema,
  getLeaderboardSchema,

  // Notifications
  getNotificationsSchema,
  markNotificationReadSchema,
  markAllNotificationsReadSchema,

  // Chat
  getChatHistorySchema,
  sendMessageSchema,

  // WebSocket
  wsJoinMatchSchema,
  wsGameMoveSchema,
  wsVoiceChatSchema,
  wsChatMessageSchema,
  wsLeaveMatchSchema,
  wsReconnectMatchSchema,

  // Admin
  adminCreateGameSchema,
  adminUpdateUserSchema,

  // Utilities
  paginationSchema,
  validateGameMove
};

export default schemas;