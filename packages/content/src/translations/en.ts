import type { ContentTranslation } from "../i18n.js";

export const en: ContentTranslation = {
  stages: {
    0: {
      title: "Basics",
      summary: "The board, how the pieces move, check, mate and special rules.",
    },
    1: {
      title: "Beginner",
      summary: "Piece values, basic mates, opening principles and first tactics.",
    },
    2: {
      title: "Improver",
      summary: "Tactical motifs, pawn endgames and a simple opening repertoire.",
    },
    3: {
      title: "Intermediate",
      summary: "Middlegame plans, pawn structures, calculation and rook endgames.",
    },
    4: {
      title: "Strong player",
      summary: "Strategy, prophylaxis and a deeper opening repertoire.",
    },
    5: {
      title: "Professional",
      summary:
        "Classic games, complex endgames, preparation and psychology.",
    },
  },
  lessons: {
    taxta: {
      title: "The chessboard",
      summary: "Squares, files, ranks and coordinates.",
      steps: [
        {
          text: "Chess is played on a board of 64 squares: 8 rows and 8 columns. Light and dark squares alternate. The bottom-right square on each player's side is always light.",
        },
        {
          text: "Columns — files — are named with letters from a to h. Rows — ranks — are numbered from 1 to 8.",
        },
        {
          text: "Each square is named by its file letter and rank number. The marked square is e4.",
        },
        {
          text: "What is the name of the marked square?",
          options: ["c6", "f3", "c3"],
          explanation: "The file is c and the rank is 6, so the square is c6.",
        },
        {
          text: "This is how the pieces stand at the start. White is on ranks 1 and 2, Black on ranks 7 and 8. White moves first.",
        },
        {
          text: "Which square does the white queen start on?",
          options: ["e1", "d1", "d8"],
          explanation:
            "The queen goes on her own colour: the white queen starts on the light square d1, with the king next to her on e1.",
        },
      ],
    },
    ruh: {
      title: "The rook",
      summary: "The piece that moves in straight lines.",
      steps: [
        {
          text: "The rook moves in a straight line — along a file or a rank — any number of squares. It cannot jump over other pieces.",
        },
        { text: "Move the rook to collect all the stars." },
        { text: "One more: collect the stars in as few moves as you can." },
        {
          text: "A rook can move onto a square with an enemy piece and capture it. Capture the black knight with your rook.",
          hint: "The knight is on the same file as the rook.",
          success: "Well done! The knight is off the board.",
        },
      ],
    },
    fil: {
      title: "The bishop",
      summary: "The piece that moves diagonally.",
      steps: [
        {
          text: "The bishop moves only diagonally, any number of squares. That is why it stays on squares of one colour for the whole game.",
        },
        { text: "Collect all the stars with the bishop." },
        {
          text: "Can a bishop on a dark square reach a light square?",
          options: ["Yes", "No"],
          explanation:
            "Moving diagonally never changes the square colour, so a bishop always stays on one colour.",
        },
        {
          text: "Capture the black rook with your bishop.",
          hint: "The rook is on the same diagonal as the bishop.",
          success: "Correct! The bishop took a rook — a big gain.",
        },
      ],
    },
    farzin: {
      title: "The queen",
      summary: "The strongest piece: a rook and a bishop in one.",
      steps: [
        {
          text: "The queen is the strongest piece. She combines the rook and the bishop: she moves in straight lines and diagonals, any number of squares.",
        },
        { text: "Collect all the stars with the queen." },
        {
          text: "Capture the black bishop with your queen.",
          hint: "The bishop is on the same diagonal as the queen.",
          success: "Great! The queen strikes far in any direction.",
        },
      ],
    },
    shoh: {
      title: "The king",
      summary: "The most important piece and how it moves.",
      steps: [
        { text: "The king is the most important piece. It moves one square in any direction." },
        { text: "Collect all the stars with the king." },
        {
          text: "The king cannot be captured, and it may never move onto an attacked square. That is why two kings never stand next to each other.",
        },
      ],
    },
    ot: {
      title: "The knight",
      summary: "The piece that moves in an L and jumps.",
      steps: [
        {
          text: "The knight moves in an L shape: two squares in one direction, then one square to the side. It is the only piece that can jump over others.",
        },
        { text: "Collect all the stars with the knight." },
        {
          text: "One more. The knight changes square colour with every move — keep that in mind.",
        },
        {
          text: "Capture the black queen with your knight.",
          hint: "Two squares up, one square to the right.",
          success: "Nice! The knight took the queen.",
        },
      ],
    },
    piyoda: {
      title: "The pawn",
      summary: "Moves forward, captures diagonally.",
      steps: [
        {
          text: "A pawn moves forward one square. On its first move it may go one or two squares.",
        },
        {
          text: "Push the pawn two squares forward.",
          success: "Correct! On its first move a pawn may go two squares.",
        },
        {
          text: "A pawn moves straight but captures diagonally: it takes an enemy piece on the square diagonally in front of it.",
        },
        {
          text: "Capture the more valuable piece — the knight — with your pawn.",
          hint: "A knight is worth more than a pawn.",
          success: "Well done! The pawn took the knight.",
        },
        {
          text: "Can a pawn move backwards?",
          options: ["Yes", "No"],
          explanation: "A pawn never moves backwards, so think before every pawn move.",
        },
      ],
    },
    urish: {
      title: "Capturing",
      summary: "How to take enemy pieces, and which ones to take.",
      steps: [
        {
          text: "A piece that moves onto a square with an enemy piece captures it, and the captured piece leaves the board. You cannot capture your own pieces.",
        },
        { text: "Capture the undefended black knight.", success: "Correct!" },
        {
          text: "The queen can capture two pieces. Which one is safe to take? Capture the undefended piece.",
          hint: "The black king defends the rook: if the queen takes it, the king takes the queen.",
          success: "Excellent! Taking the rook would lose your queen to the king. The knight had no defender.",
        },
      ],
    },
    "shoh-berish": {
      title: "Check",
      summary: "Attacking the king and three ways out.",
      steps: [
        {
          text: "Attacking the king is called “check”. The side in check must get out of it at once — no other move is allowed.",
        },
        {
          text: "Give check to the black king with your rook.",
          hint: "Move the rook to the black king's rank.",
          success: "Correct! The black king is in check.",
        },
        {
          text: "There are three ways out of check: move the king to a safe square, capture the attacking piece, or block the attack with another piece.",
        },
        {
          text: "The white king is in check! Capture the attacking rook.",
          hint: "Both the knight and the king can take the rook.",
          success: "Well done! The attacker is gone.",
        },
        {
          text: "Check again. This time block it with the knight.",
          hint: "Put the knight on the first rank, between the rook and the king.",
          success: "Correct! The knight blocked the line of attack.",
        },
      ],
    },
    mat: {
      title: "Checkmate",
      summary: "The goal of the game: checkmate the enemy king.",
      steps: [
        {
          text: "If the king is in check and there is no way out, that is checkmate. The side that gives checkmate wins.",
        },
        {
          text: "Here the black king is checkmated: the rook gives check, and his own pawns stop him from escaping.",
        },
        {
          text: "Checkmate in one move.",
          hint: "The black king is trapped on the back rank.",
          success: "Checkmate! You won.",
        },
        {
          text: "Checkmate in one move with the queen.",
          hint: "The white king covers g7 and h7.",
          success: "Checkmate! Queen and king worked together.",
        },
        {
          text: "Checkmate in one move with the rook.",
          hint: "Move the rook to the eighth rank.",
          success: "Checkmate!",
        },
      ],
    },
    pat: {
      title: "Stalemate",
      summary: "No moves but no check — a draw.",
      steps: [
        {
          text: "If the side to move is not in check but has no legal move, that is stalemate. Stalemate is a draw.",
        },
        {
          text: "Black is to move here. What is this position?",
          options: ["Checkmate", "Stalemate", "Check"],
          explanation:
            "The black king is not in check, but it has no safe square to move to. That is stalemate — a draw.",
        },
        {
          text: "The winning side must avoid stalemate. Checkmate in one move without stalemating.",
          hint: "Move the queen to the eighth rank.",
          success: "Checkmate! Moving to f7 would have been stalemate.",
        },
      ],
    },
    rokirovka: {
      title: "Castling",
      summary: "The special move of king and rook.",
      steps: [
        {
          text: "Castling is a special move of the king and a rook together. The king moves two squares towards the rook, and the rook jumps over the king to stand next to it. Castling takes the king to safety.",
        },
        {
          text: "Castle kingside: move the king to g1.",
          success: "Correct! The rook went to f1.",
        },
        {
          text: "Now castle queenside: move the king to c1.",
          success: "Correct! The rook went to d1.",
        },
        {
          text: "When is castling not allowed?",
          options: [
            "When the king or that rook has already moved",
            "When there are queens on the board",
            "After move 10",
          ],
          explanation:
            "Neither the king nor the rook may have moved. Also, the king must not be in check, the squares it crosses must not be attacked, and no pieces may stand between the king and the rook.",
        },
      ],
    },
    "yolda-urish": {
      title: "En passant",
      summary: "A special pawn capture.",
      steps: [
        {
          text: "If an enemy pawn moves two squares on its first move and lands next to your pawn, you may capture it as if it had moved only one square. You can do this only immediately, on the very next move.",
        },
        {
          text: "The black pawn has just moved from d7 to d5. Capture it en passant.",
          hint: "Move your pawn diagonally to d6.",
          success: "Correct! The black pawn is off the board.",
        },
      ],
    },
    "piyoda-aylanishi": {
      title: "Promotion",
      summary: "A pawn that reaches the last rank becomes another piece.",
      steps: [
        {
          text: "A pawn that reaches the last rank immediately becomes a queen, rook, bishop or knight. Most often the strongest piece — the queen — is chosen.",
        },
        {
          text: "Push the pawn to the last rank and promote it to a queen.",
          hint: "Move the pawn to b8, then choose the queen.",
          success: "Excellent! You have a new queen.",
        },
      ],
    },
    "donalar-qiymati": {
      title: "Piece values",
      summary: "What each piece is worth and which trades pay off.",
      steps: [
        {
          text: "Piece strength is measured in pawns: pawn 1, knight 3, bishop 3, rook 5, queen 9. The king is priceless: lose it and you lose the game.",
        },
        {
          text: "Is it good to give a rook for a knight?",
          options: ["Yes, it pays off", "No, it loses two pawns' worth"],
          explanation: "A rook is worth 5 and a knight 3. Giving a rook for a knight loses two pawns' worth of strength.",
        },
        {
          text: "Roughly how many pawns is a queen worth?",
          options: ["5", "9", "3"],
          explanation: "The queen is worth 9. She combines a rook (5) and a bishop (3) and is even stronger than both.",
        },
        {
          text: "The knight can capture two pieces. Take the most valuable one.",
          hint: "A rook is worth five pawns.",
          success: "Correct! A rook is worth 5, a pawn only 1.",
        },
      ],
    },
    "farzin-bilan-mat": {
      title: "Mate with the queen",
      summary: "How king and queen checkmate a lone king.",
      steps: [
        {
          text: "King and queen checkmate a lone king easily. The plan: use the queen to push the enemy king to the edge, then bring your king closer and deliver mate.",
        },
        {
          text: "A queen placed a knight's move away from the enemy king locks it in a box. But careful: if the king has no moves at all, it is stalemate.",
        },
        {
          text: "Practice first: checkmate in one move.",
          hint: "Move the queen to the eighth rank — the king protects her.",
          success: "Checkmate!",
        },
        {
          text: "Now on your own: checkmate with the queen. The bot defends as well as it can.",
        },
      ],
    },
    "ruh-bilan-mat": {
      title: "Mate with the rook",
      summary: "How king and rook deliver mate together.",
      steps: [
        {
          text: "To mate with king and rook, both pieces must work together: the rook cuts the enemy king off, and your king, standing opposite, pushes it to the edge.",
        },
        {
          text: "The kings face each other. Checkmate in one move.",
          hint: "Move the rook to the eighth rank.",
          success: "Checkmate! The white king covers the black king's escape squares.",
        },
        {
          text: "Now the full exercise: checkmate with the rook. The bot defends as well as it can.",
        },
      ],
    },
    "ikki-ruh-bilan-mat": {
      title: "Mate with two rooks",
      summary: "The “ladder” technique.",
      steps: [
        {
          text: "Two rooks take turns giving check and push the king to the edge like a ladder. One rook cuts the king off while the other gives check. White's king is not needed.",
        },
        {
          text: "Checkmate with the two rooks. Keep them away from the king — it can capture them.",
        },
      ],
    },
    "debyut-qoidalari": {
      title: "Golden rules of the opening",
      summary: "Three rules for starting a game well.",
      steps: [
        {
          text: "The opening has three main tasks: control the centre, bring out knights and bishops quickly, and castle to get the king to safety. The centre is e4, d4, e5 and d5.",
        },
        {
          text: "Take the centre: push a pawn to e4 or d4.",
          success: "Correct! The pawn holds the centre and opens lines for your pieces.",
        },
        {
          text: "Develop a knight towards the centre.",
          hint: "On f3 or c3 the knight controls the centre.",
          success: "Good! The knight controls central squares.",
        },
        {
          text: "Bring the bishop to an active square.",
          hint: "The bishop is active on c4 or b5.",
          success: "Excellent! Now the way is clear for castling.",
        },
        {
          text: "Now get the king to safety.",
          hint: "Castle kingside.",
          success: "Correct! The king is safe and the rook joins the game.",
        },
        {
          text: "Why is it risky to bring the queen out early?",
          options: [
            "The opponent chases her with pieces and gains time",
            "The queen cannot move in the opening",
            "It is against the rules",
          ],
          explanation:
            "Your opponent attacks the queen while developing pieces, and you lose time moving her away.",
        },
      ],
    },
    vilka: {
      title: "The fork",
      summary: "One piece attacking two targets.",
      steps: [
        {
          text: "A fork is when one piece attacks two or more enemy pieces at once. Only one of them can be saved. Knight forks are especially dangerous.",
        },
        {
          text: "Fork with the knight: attack both the king and the rook.",
          hint: "Which squares does a knight on c7 attack?",
          success: "Fork! The king moves, and next move you take the rook.",
        },
        {
          text: "Fork with the queen: give check and attack the rook at the same time.",
          hint: "From d5 the queen controls two diagonals.",
          success: "Excellent! Once the king moves, the queen takes the rook on a8.",
        },
        { text: "Solve fork puzzles taken from real games." },
      ],
    },
    boglash: {
      title: "The pin",
      summary: "Freezing a piece in place.",
      steps: [
        {
          text: "A pin is when a piece cannot move because a more valuable piece stands behind it. If the king is behind, the pinned piece cannot move at all.",
        },
        {
          text: "Pin the black knight to the king with your bishop.",
          hint: "The knight and the king are on the same diagonal.",
          success: "Correct! Now the knight cannot move.",
        },
        {
          text: "Attack the pinned knight with a pawn — it cannot run away.",
          hint: "Push the pawn to a square where it attacks the knight.",
          success: "Well done! The knight cannot escape and will be captured.",
        },
        { text: "Solve pin puzzles." },
      ],
    },
    shish: {
      title: "The skewer",
      summary: "Chase away the valuable piece and take the one behind it.",
      steps: [
        {
          text: "A skewer is a pin in reverse: the valuable piece in front — often the king — has to move out of the attack, and the piece behind it is captured.",
        },
        {
          text: "Skewer with the bishop: give check, and when the king moves, take the queen behind it.",
          hint: "The black king and queen are on the same long diagonal.",
          success: "Skewer! The king moves away and the queen is yours.",
        },
        { text: "Solve skewer puzzles." },
      ],
    },
    "himoyasiz-dona": {
      title: "Hanging pieces",
      summary: "Spot free pieces and keep yours safe.",
      steps: [
        {
          text: "Before every move ask two questions: which piece did my opponent leave undefended? And are my own pieces defended?",
        },
        {
          text: "Find the undefended black piece and take it.",
          hint: "Which black piece is not defended by anything?",
          success: "Correct! The bishop had no defender.",
        },
        {
          text: "Your knight is attacked! Move it to a safe square.",
          hint: "The black pawn attacks f3. Move the knight somewhere else.",
          success: "Good! Always check your own pieces.",
        },
        { text: "Solve hanging piece puzzles." },
      ],
    },
  },
};
