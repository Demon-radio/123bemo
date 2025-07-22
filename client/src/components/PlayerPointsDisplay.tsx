import { useState, useEffect } from "react";
import { Trophy, Star, Target, Award } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface PlayerPoints {
  id: number;
  player_name: string;
  email?: string;
  total_points: number;
  games_played: number;
  achievements_earned: number;
  last_played: string;
  created_at: string;
}

interface GameSession {
  id: number;
  player_name: string;
  game_type: string;
  score: number;
  points_earned: number;
  session_duration?: number;
  level_reached: number;
  completed: boolean;
  created_at: string;
}

interface PlayerPointsDisplayProps {
  isOpen: boolean;
  onClose: () => void;
  playerName: string;
  onPointsUpdate?: (points: number) => void;
}

export function PlayerPointsDisplay({ isOpen, onClose, playerName, onPointsUpdate }: PlayerPointsDisplayProps) {
  const [playerPoints, setPlayerPoints] = useState<PlayerPoints | null>(null);
  const [recentSessions, setRecentSessions] = useState<GameSession[]>([]);
  const [leaderboard, setLeaderboard] = useState<PlayerPoints[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'sessions' | 'leaderboard'>('profile');
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && playerName) {
      loadPlayerData();
    }
  }, [isOpen, playerName]);

  const loadPlayerData = async () => {
    setLoading(true);
    try {
      // Load player points
      const pointsResponse = await fetch(`/api/players/${encodeURIComponent(playerName)}/points`);
      if (pointsResponse.ok) {
        const pointsData = await pointsResponse.json();
        setPlayerPoints(pointsData.player);
        onPointsUpdate?.(pointsData.player.total_points);
      }

      // Load recent sessions
      const sessionsResponse = await fetch(`/api/players/${encodeURIComponent(playerName)}/sessions?limit=5`);
      if (sessionsResponse.ok) {
        const sessionsData = await sessionsResponse.json();
        setRecentSessions(sessionsData.sessions);
      }

      // Load leaderboard
      const leaderboardResponse = await fetch('/api/leaderboard?limit=10');
      if (leaderboardResponse.ok) {
        const leaderboardData = await leaderboardResponse.json();
        setLeaderboard(leaderboardData.leaderboard);
      }
    } catch (error) {
      console.error('Error loading player data:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في تحميل بيانات اللاعب",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getGameTypeArabicName = (gameType: string): string => {
    const gameNames: { [key: string]: string } = {
      'quiz': 'اختبار المعرفة',
      'battle': 'معركة المعرفة', 
      'bmo': 'مغامرة BMO',
      'rpg': 'لعبة BMO RPG',
      'tictactoe': 'لعبة BMO X.O',
      'maze': 'متاهة BMO'
    };
    return gameNames[gameType] || gameType;
  };

  const getPlayerRank = (): number => {
    if (!playerPoints || leaderboard.length === 0) return 0;
    const index = leaderboard.findIndex(p => p.player_name === playerPoints.player_name);
    return index >= 0 ? index + 1 : 0;
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogTitle>إحصائيات اللاعب</DialogTitle>
          <DialogDescription>جاري تحميل البيانات...</DialogDescription>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogTitle>إحصائيات اللاعب - {playerName}</DialogTitle>
        <DialogDescription>عرض النقاط والإحصائيات والسجل</DialogDescription>
        
        <div className="space-y-4">
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-muted rounded-lg p-1">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'profile' ? 'bg-white shadow-sm' : 'hover:bg-muted-foreground/10'
              }`}
            >
              الملف الشخصي
            </button>
            <button
              onClick={() => setActiveTab('sessions')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'sessions' ? 'bg-white shadow-sm' : 'hover:bg-muted-foreground/10'
              }`}
            >
              آخر الجلسات
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'leaderboard' ? 'bg-white shadow-sm' : 'hover:bg-muted-foreground/10'
              }`}
            >
              لوحة المتصدرين
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {playerPoints ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">إجمالي النقاط</CardTitle>
                        <Star className="h-4 w-4 text-yellow-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-primary">
                          {playerPoints.total_points.toLocaleString()}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">الألعاب الملعوبة</CardTitle>
                        <Target className="h-4 w-4 text-blue-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {playerPoints.games_played}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">الترتيب</CardTitle>
                        <Trophy className="h-4 w-4 text-amber-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          #{getPlayerRank() || '—'}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">الإنجازات</CardTitle>
                        <Award className="h-4 w-4 text-green-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {playerPoints.achievements_earned}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <Card>
                    <CardContent className="flex items-center justify-center h-32">
                      <p className="text-muted-foreground">لم يتم العثور على بيانات اللاعب</p>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            )}

            {activeTab === 'sessions' && (
              <motion.div
                key="sessions"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>آخر الجلسات</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {recentSessions.length > 0 ? (
                      <div className="space-y-3">
                        {recentSessions.map((session) => (
                          <div
                            key={session.id}
                            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                          >
                            <div>
                              <div className="font-medium">{getGameTypeArabicName(session.game_type)}</div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(session.created_at).toLocaleDateString('ar-EG')}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-lg">{session.score.toLocaleString()}</div>
                              <Badge variant={session.completed ? "default" : "secondary"}>
                                +{session.points_earned} نقطة
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        لا توجد جلسات سابقة
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'leaderboard' && (
              <motion.div
                key="leaderboard"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>لوحة المتصدرين</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {leaderboard.length > 0 ? (
                      <div className="space-y-2">
                        {leaderboard.map((player, index) => (
                          <div
                            key={player.id}
                            className={`flex items-center justify-between p-3 rounded-lg ${
                              player.player_name === playerName
                                ? 'bg-primary/10 border border-primary/20'
                                : 'bg-muted/30'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                                index === 0 ? 'bg-yellow-500 text-white' :
                                index === 1 ? 'bg-gray-400 text-white' :
                                index === 2 ? 'bg-amber-600 text-white' :
                                'bg-muted text-muted-foreground'
                              }`}>
                                {index + 1}
                              </div>
                              <div>
                                <div className="font-medium">{player.player_name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {player.games_played} لعبة
                                </div>
                              </div>
                            </div>
                            <div className="font-bold text-lg">
                              {player.total_points.toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        لا توجد بيانات في لوحة المتصدرين
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose}>إغلاق</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}