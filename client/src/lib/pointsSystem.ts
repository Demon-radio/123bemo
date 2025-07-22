// Points system utilities for BMO Tools games

export interface GameResult {
  playerName: string;
  gameType: string;
  score: number;
  levelReached?: number;
  sessionDuration?: number;
  completed?: boolean;
}

export interface PointsCalculation {
  basePoints: number;
  bonusPoints: number;
  totalPoints: number;
  multiplier: number;
}

// Points multipliers for different game types
const GAME_MULTIPLIERS: { [key: string]: number } = {
  'quiz': 0.1,
  'battle': 0.15,
  'bmo': 0.2,
  'rpg': 0.25,
  'tictactoe': 0.1,
  'maze': 0.2
};

// Level completion bonuses
const LEVEL_BONUS_POINTS: { [key: string]: number } = {
  'quiz': 50,
  'battle': 75,
  'bmo': 100,
  'rpg': 150,
  'tictactoe': 25,
  'maze': 100
};

/**
 * Calculate points earned for a game session
 */
export function calculatePoints(gameResult: GameResult): PointsCalculation {
  const { gameType, score, levelReached = 1, completed = false } = gameResult;
  
  // Base points from score
  const multiplier = GAME_MULTIPLIERS[gameType] || 0.1;
  const basePoints = Math.floor(score * multiplier);
  
  // Bonus points for completion and level progression
  let bonusPoints = 0;
  
  if (completed) {
    bonusPoints += LEVEL_BONUS_POINTS[gameType] || 50;
  }
  
  // Level progression bonus (for games with levels)
  if (levelReached > 1) {
    bonusPoints += (levelReached - 1) * 25;
  }
  
  const totalPoints = basePoints + bonusPoints;
  
  return {
    basePoints,
    bonusPoints,
    totalPoints,
    multiplier
  };
}

/**
 * Submit game session to the backend
 */
export async function submitGameSession(gameResult: GameResult): Promise<{
  success: boolean;
  pointsEarned: number;
  message: string;
}> {
  try {
    const pointsCalc = calculatePoints(gameResult);
    
    const sessionData = {
      player_name: gameResult.playerName,
      game_type: gameResult.gameType,
      score: gameResult.score,
      points_earned: pointsCalc.totalPoints,
      session_duration: gameResult.sessionDuration || 0,
      level_reached: gameResult.levelReached || 1,
      completed: gameResult.completed || false
    };

    const response = await fetch('/api/games/submit-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sessionData),
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      return {
        success: true,
        pointsEarned: data.points_earned,
        message: `تم كسب ${data.points_earned} نقطة!`
      };
    } else {
      console.error('Failed to submit game session:', data);
      return {
        success: false,
        pointsEarned: 0,
        message: 'فشل في حفظ النتائج'
      };
    }
  } catch (error) {
    console.error('Error submitting game session:', error);
    return {
      success: false,
      pointsEarned: 0,
      message: 'حدث خطأ في الاتصال'
    };
  }
}

/**
 * Get player points from the backend
 */
export async function getPlayerPoints(playerName: string): Promise<{
  success: boolean;
  player?: any;
  message: string;
}> {
  try {
    const response = await fetch(`/api/players/${encodeURIComponent(playerName)}/points`);
    const data = await response.json();
    
    if (response.ok && data.success) {
      return {
        success: true,
        player: data.player,
        message: 'تم تحميل النقاط بنجاح'
      };
    } else {
      return {
        success: false,
        message: data.message || 'لم يتم العثور على اللاعب'
      };
    }
  } catch (error) {
    console.error('Error fetching player points:', error);
    return {
      success: false,
      message: 'حدث خطأ في الاتصال'
    };
  }
}

/**
 * Get leaderboard from the backend
 */
export async function getLeaderboard(limit: number = 10): Promise<{
  success: boolean;
  leaderboard?: any[];
  message: string;
}> {
  try {
    const response = await fetch(`/api/leaderboard?limit=${limit}`);
    const data = await response.json();
    
    if (response.ok && data.success) {
      return {
        success: true,
        leaderboard: data.leaderboard,
        message: 'تم تحميل لوحة المتصدرين بنجاح'
      };
    } else {
      return {
        success: false,
        message: data.message || 'فشل في تحميل لوحة المتصدرين'
      };
    }
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return {
      success: false,
      message: 'حدث خطأ في الاتصال'
    };
  }
}

/**
 * Format points number for display
 */
export function formatPoints(points: number): string {
  if (points >= 1000000) {
    return `${(points / 1000000).toFixed(1)}م`;
  } else if (points >= 1000) {
    return `${(points / 1000).toFixed(1)}ك`;
  }
  return points.toString();
}

/**
 * Get achievement message based on points or milestones
 */
export function getAchievementMessage(totalPoints: number, gamesPlayed: number): string | null {
  if (totalPoints >= 100000) {
    return "🏆 أسطورة الألعاب! حققت 100,000 نقطة!";
  } else if (totalPoints >= 50000) {
    return "🌟 خبير الألعاب! حققت 50,000 نقطة!";
  } else if (totalPoints >= 10000) {
    return "🎯 لاعب متمرس! حققت 10,000 نقطة!";
  } else if (totalPoints >= 5000) {
    return "🚀 لاعب ماهر! حققت 5,000 نقطة!";
  } else if (totalPoints >= 1000) {
    return "⭐ لاعب جيد! حققت 1,000 نقطة!";
  } else if (gamesPlayed >= 50) {
    return "🎮 مدمن ألعاب! لعبت 50 لعبة!";
  } else if (gamesPlayed >= 10) {
    return "🎲 لاعب نشط! لعبت 10 ألعاب!";
  }
  
  return null;
}