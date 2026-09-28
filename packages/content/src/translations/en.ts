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
    "ochiq-hujum": {
      title: "Discovered attack",
      summary: "One piece moves and uncovers the piece behind it.",
      steps: [
        {
          text: "A discovered attack is when a piece moves out of the way and a rook, bishop or queen behind it starts attacking. If the moving piece makes a threat too, the opponent cannot answer both at once.",
        },
        {
          text: "When the front piece moves and the piece behind it gives check, what is it called?",
          options: ["Discovered check", "Pin", "Fork"],
          explanation:
            "It is a discovered check. The opponent must deal with the check, while the front piece can go anywhere and take something.",
        },
        {
          text: "Move the bishop with check — the rook is uncovered against the black queen.",
          hint: "The bishop should clear the d-file and attack the king at the same time.",
          success: "Discovered attack! Whatever Black does with the king, the rook takes the queen on d8.",
        },
        { text: "Solve discovered attack puzzles." },
      ],
    },
    "qosh-shoh": {
      title: "Double check",
      summary: "Two pieces give check at once.",
      steps: [
        {
          text: "Double check is the strongest discovered attack: both the moving piece and the piece it uncovers give check. One move cannot capture or block two pieces.",
        },
        {
          text: "How can you answer a double check?",
          options: [
            "Only by moving the king",
            "By capturing one of the checking pieces",
            "By blocking with a piece",
          ],
          explanation:
            "Even if you capture or block one piece, the other still gives check. So in a double check only the king can move.",
        },
        {
          text: "Give double check with the knight — it is mate.",
          hint: "When the knight moves, the e-file opens and the rook gives check too.",
          success: "Double check and mate! Even if Black takes the knight, the rook still gives check, and the king has nowhere to go.",
        },
        { text: "Solve double check puzzles." },
      ],
    },
    "oxirgi-qator": {
      title: "Back-rank mate",
      summary: "A king trapped by its own pawns.",
      steps: [
        {
          text: "After castling the king often sits behind its own pawns. If an enemy rook or queen reaches the back rank, the king has no escape — that is mate.",
        },
        {
          text: "Mate in one move.",
          hint: "Bring the rook to the back rank.",
          success: "Mate! The black king was blocked in by its own pawns.",
        },
        {
          text: "How can you guard against a back-rank mate?",
          options: [
            "Push one pawn in front of the king to make an escape square",
            "Keep all the pawns where they are",
            "Move the rooks off the back rank",
          ],
          explanation:
            "One pawn move, such as h3, gives the king an escape square. This square is called luft.",
        },
        {
          text: "The black rooks guard the back rank, but they are overloaded. Start with a sacrifice and mate in two moves.",
          hint: "Take the rook on d8 with the queen. If Black takes back, the back rank is left empty.",
          success: "Excellent! If Black recaptures with the rook, the white rook goes to d8 with mate.",
        },
        { text: "Solve back-rank mate puzzles." },
      ],
    },
    "kvadrat-qoidasi": {
      title: "The rule of the square",
      summary: "Can the king catch a runaway pawn?",
      steps: [
        {
          text: "Can the king catch a lone pawn? To know without counting, draw a square whose side runs from the pawn to its promotion square. For the pawn on h5 that is the square d1–h1–h5–d5. If the king can step inside the square, it catches the pawn.",
        },
        {
          text: "Bring the white king into the square and catch the pawn.",
          hint: "The square starts on the d-file. Move the king to the d-file.",
          success: "Correct! The king is inside the square — the pawn cannot escape now.",
        },
        {
          text: "White to move. Can the black king catch the pawn on a5?",
          options: ["Yes, it can", "No, the pawn becomes a queen"],
          explanation:
            "The pawn's square is a5–d5–d8–a8. The black king on e5 is outside it, and it is White's move. After the pawn goes to a6 the square shrinks and the king cannot reach it.",
        },
        { text: "Solve pawn endgame puzzles." },
      ],
    },
    oppozitsiya: {
      title: "The opposition",
      summary: "A fight between kings: who gives way.",
      steps: [
        {
          text: "The opposition is when the kings face each other with one square between them. Kings can never come closer, so the side to move has to give way. Here Black is to move and must let the white king through.",
        },
        {
          text: "Take the opposition.",
          hint: "Put your king right in front of the black king, with one square between them.",
          success: "Correct! Now the black king must give way and the white king goes forward.",
        },
        {
          text: "Rule: the king walks in front of the pawn. Bring the king forward.",
          hint: "Go to the fifth rank — let the king clear the way for the pawn.",
          success: "Good! With the king in front, the pawn can advance safely.",
        },
        {
          text: "Now on your own: promote the pawn and give mate. The bot defends as well as it can.",
        },
      ],
    },
    "italyan-partiyasi": {
      title: "The Italian Game",
      summary: "An old, clear first opening.",
      steps: [
        {
          text: "The Italian Game is one of the oldest openings. It follows the opening principles exactly: the centre, quick development and castling. Let's play it together.",
        },
        {
          text: "Black has taken the centre too. Develop the knight and attack the pawn on e5.",
          hint: "From f3 the knight attacks e5.",
          success: "Correct! Black defended the pawn with a knight.",
        },
        {
          text: "Develop the bishop towards f7.",
          hint: "Only the black king defends f7. From c4 the bishop aims at it.",
          success: "This is the Italian Game! The bishop aims at the weakest point next to the black king.",
        },
        {
          text: "Black has brought the bishop to c5 too. Prepare d4 to take the whole centre.",
          hint: "Push the c-pawn one square: it supports d4.",
          success: "Excellent! Next you take the centre with d4.",
        },
        {
          text: "On move three Black played the knight to f6, and White jumped the knight to g5. Which square do the white knight and bishop attack together?",
          options: ["f7", "h7", "d5"],
          explanation:
            "Both the knight on g5 and the bishop on c4 aim at f7. Black must defend it precisely, or White starts an attack on f7.",
        },
        { text: "Solve puzzles on opening tactics." },
      ],
    },
    "orta-oyin-rejasi": {
      title: "Middlegame plans",
      summary: "Judging a position and making a plan.",
      steps: [
        {
          text: "When the opening is over, you need a plan. To judge a position, look at four things: material, king safety, piece activity and pawn structure.",
        },
        {
          text: "The plan comes from the position. If the enemy king is exposed, attack. If you are ahead in material, trade pieces. If the opponent has a weak pawn, put pressure on it.",
        },
        {
          text: "You are a rook up. Which plan is right?",
          options: ["Trade pieces and go into an endgame", "Avoid trading pieces", "Offer a draw"],
          explanation:
            "The fewer pieces on the board, the stronger the extra rook. Trade pieces but keep your pawns — they can become queens.",
        },
        {
          text: "Which piece is called a “bad” piece?",
          options: [
            "A piece that takes no part in the game and controls few squares",
            "The piece that has moved the most",
            "A piece in the centre",
          ],
          explanation:
            "A bad piece is one that is not taking part in the game. Often the best plan is to move that piece to a better square.",
        },
        {
          text: "A simple rule: find your worst piece and improve it. Small improvements add up to a big advantage.",
        },
      ],
    },
    "piyoda-tuzilmasi": {
      title: "Pawn structure",
      summary: "Isolated, doubled and passed pawns.",
      steps: [
        {
          text: "An isolated pawn has no friendly pawns on the files next to it. No pawn can defend it, and the square in front of it is a good post for an enemy piece.",
        },
        {
          text: "Doubled pawns are two pawns on the same file. They cannot defend each other and they block each other's way.",
        },
        {
          text: "A passed pawn has no enemy pawns in front of it or on the files next to it. Only pieces can stop it. In the endgame a passed pawn is often the deciding force.",
        },
        {
          text: "Which white pawn is a passed pawn?",
          options: ["e5", "b2", "h2"],
          explanation:
            "There are no black pawns in front of e5 or on the d- and f-files. Black pawns stand in front of b2 and h2.",
        },
        {
          text: "A famous breakthrough: three pawns against three. Sacrifice a pawn to create a passed pawn.",
          hint: "Push the middle pawn.",
          success: "Excellent! Whichever pawn Black captures with, White sacrifices another pawn and the third one promotes.",
        },
        { text: "Solve puzzles with advanced pawns." },
      ],
    },
    hisoblash: {
      title: "Calculation",
      summary: "Checks, captures and threats.",
      steps: [
        {
          text: "Before every move look at the forcing moves: checks, captures and threats. They limit the opponent's replies, so they are easy to calculate to the end.",
        },
        {
          text: "When you calculate, look for the opponent's strongest reply. Play the line through in your head to the end and judge the final position. Do not move hoping for a trap.",
        },
        {
          text: "Which moves should you start calculating with?",
          options: ["Checks, captures and threats", "Pawn moves", "King moves"],
          explanation:
            "Forcing moves leave the opponent few choices. The strongest moves are usually among them, and they are quick to calculate.",
        },
        {
          text: "Mate in two. Start with the forcing moves.",
          hint: "Sacrifice the queen: take the pawn on h7.",
          success: "Well calculated! The king takes the queen and the rook goes to h5 with mate. This is Anastasia's mate.",
        },
        { text: "Solve mate-in-two puzzles. Calculate each one to the end." },
      ],
    },
    "bogilgan-mat": {
      title: "Smothered mate",
      summary: "A knight mates a king boxed in by its own pieces.",
      steps: [
        {
          text: "A smothered mate is when the king's escape squares are taken by its own pieces and a knight gives mate. A knight's check cannot be blocked.",
        },
        {
          text: "Mate with the knight.",
          hint: "From which square does the knight attack h8?",
          success: "Smothered mate! The black king was boxed in by its own pieces.",
        },
        {
          text: "A famous combination: sacrifice the queen and mate in two moves.",
          hint: "The queen gives check on g8. Black can only take it with the rook.",
          success: "Philidor's legacy! The rook has filled g8 and the knight mates on f7.",
        },
        { text: "Solve smothered mate puzzles." },
      ],
    },
    lusena: {
      title: "The Lucena position",
      summary: "Winning a rook endgame by building a bridge.",
      steps: [
        {
          text: "The Lucena position is the most important rook endgame position. The white pawn is one step from promotion, but the white king is stuck in front of it. The way to win is “building a bridge”.",
        },
        {
          text: "The plan: check with the rook to drive the black king away from the pawn. Then put the rook on the fourth rank. When the white king comes out, the black rook checks from behind — and the white rook blocks the checks, building the bridge.",
        },
        {
          text: "The black rook is checking from behind. Build the bridge!",
          hint: "Block the check with the rook — that is exactly why it stands on the fourth rank.",
          success: "The bridge is built! The checks are over and the pawn becomes a queen.",
        },
        {
          text: "Now on your own: win the Lucena position and give mate. The bot defends as well as it can.",
        },
        { text: "Solve rook endgame puzzles." },
      ],
    },
    filidor: {
      title: "The Philidor position",
      summary: "How to draw a rook endgame.",
      steps: [
        {
          text: "The Philidor position is the defending side's way to draw. The black king stands in front of the pawn, and the black rook on the sixth rank keeps the white king from advancing.",
        },
        {
          text: "What does the black rook do on the sixth rank?",
          options: ["Keeps the white king from advancing", "Attacks the pawn", "Pins the white rook"],
          explanation:
            "If the white king reached the sixth rank, it would clear the way for the pawn and threaten mate. The black rook does not allow it.",
        },
        {
          text: "If White pushes the pawn to the sixth rank, what does Black do?",
          options: [
            "Drops the rook down and checks from behind",
            "Keeps the rook on the sixth rank",
            "Moves the king to the side",
          ],
          explanation:
            "Once the pawn is on the sixth rank, the white king can no longer hide behind it. The black rook drops down and checks from behind without end — a draw.",
        },
        {
          text: "White has pushed the pawn to e6. Find the right reply for Black.",
          hint: "Move the rook down the file so it can check the white king from behind.",
          success: "Correct! Now you keep checking the white king from behind and it finds no shelter — a draw.",
        },
      ],
    },
    forpost: {
      title: "Outposts",
      summary: "A weak square and a piece firmly placed on it.",
      steps: [
        {
          text: "A weak square is one that enemy pawns can never attack again. Every pawn move leaves such squares behind, so push pawns with care.",
        },
        {
          text: "An outpost is a weak square of the opponent that your own pawn defends. A knight on an outpost is especially strong: pawns cannot drive it away, it can only be traded for a piece.",
        },
        {
          text: "Which square is an outpost for the white knight?",
          options: ["d5", "f5", "b5"],
          explanation:
            "Black pawns cannot attack d5: there is no c-pawn, and the e-pawn has already passed it on e5. The pawn on e4 defends d5. The g-pawn can attack f5 from g6, and the a-pawn can attack b5 from a6.",
        },
        {
          text: "Put the knight on the outpost.",
          hint: "Which square can black pawns never attack?",
          success: "Excellent! The knight stands firmly on d5 and reaches both wings.",
        },
      ],
    },
    "yaxshi-yomon-fil": {
      title: "Good and bad bishops",
      summary: "Bishops, knights and pawn colours.",
      steps: [
        {
          text: "A bad bishop moves on the same colour as its own pawns: the pawns block its way. A good bishop moves freely on the other colour.",
        },
        {
          text: "Which bishop is good in this position?",
          options: ["The white bishop", "The black bishop"],
          explanation:
            "The black pawns on d5 and e6 are on light squares, and the black bishop also moves on light squares, stuck behind its own pawns. The white pawns are on dark squares, so the white bishop is free.",
        },
        {
          text: "Bishop against knight: in an open position, with few pawns and open diagonals, the bishop is stronger. In a closed position, with pawn chains, the knight is stronger — it jumps over the pawns.",
        },
        {
          text: "Which piece is usually stronger in a closed position?",
          options: ["The knight", "The bishop"],
          explanation:
            "In a closed position the diagonals are blocked by pawns. The knight jumps over obstacles and settles on weak squares.",
        },
        {
          text: "Two bishops are a big advantage in an open position: together they control squares of both colours. If you have the bishop pair, try to open the position.",
        },
      ],
    },
    "ochiq-chiziq": {
      title: "Open files and the seventh rank",
      summary: "Where to put your rooks.",
      steps: [
        {
          text: "An open file has no pawns on it. Rooks are strongest on open files: through them they break into the enemy camp. The side that takes the open file first gets the advantage.",
        },
        {
          text: "Take the only open file.",
          hint: "Which file has no pawns at all?",
          success: "Correct! The rook has taken the d-file.",
        },
        {
          text: "A rook on the seventh rank attacks the enemy pawns from the side and traps the king on the back rank. Two rooks on the seventh often threaten mate.",
        },
        {
          text: "Bring the rook to the seventh rank.",
          hint: "The d-file is open — use it.",
          success: "Excellent! The rook on the seventh attacks the pawn on b7.",
        },
      ],
    },
    profilaktika: {
      title: "Prophylaxis",
      summary: "Stopping the opponent's plan in advance.",
      steps: [
        {
          text: "Prophylaxis means spotting the opponent's plan in advance and not letting it happen. Before every move ask: “What does my opponent want to do next?”",
        },
        {
          text: "The white rook can take the pawn on a7. But think first: what is Black threatening?",
          hint: "What happens if the black rook goes to d1? Give your king an escape square.",
          success: "Correct! Now there is no back-rank mate. If you had taken the pawn, the black rook would mate on d1.",
        },
        {
          text: "What is a prophylactic move?",
          options: [
            "A move that stops the opponent's plan in advance",
            "A move made only with the king",
            "A move that always attacks",
          ],
          explanation:
            "Prophylaxis takes away the opponent's best move before it is played. Such moves look quiet, but they leave the opponent without a plan.",
        },
      ],
    },
    "debyut-repertuari": {
      title: "Opening repertoire",
      summary: "The Sicilian Defence and the Queen's Gambit.",
      steps: [
        {
          text: "A repertoire is the set of openings you always play. Choose one first move with White, and prepare answers to e4 and d4 with Black. Do not memorise moves — understand the ideas.",
        },
        {
          text: "As Black, answer e4 with the Sicilian Defence: push the c-pawn two squares.",
          hint: "The c-pawn controls d4.",
          success: "The Sicilian Defence! Black fights for the centre from the side.",
        },
        {
          text: "In the main line of the Sicilian, White opens the centre with d4 and Black trades the c-pawn for the pawn on d4. Black gets the half-open c-file, White is ahead in development. The position is sharp: both sides play to win.",
        },
        {
          text: "You played d4 with White and Black answered d5. Play the Queen's Gambit: push the c-pawn two squares.",
          hint: "From c4 the pawn attacks d5.",
          success: "The Queen's Gambit! White wants to lure the black pawn away from the centre.",
        },
        {
          text: "If Black supports d5 with e6, it is the Queen's Gambit Declined. Black's position is solid, but the bishop on c8 is shut in behind its own pawns.",
        },
        {
          text: "If Black accepts the gambit and takes the pawn on c4, can White win it back?",
          options: ["Yes, usually White wins it back", "No, the pawn is lost for good"],
          explanation:
            "Black cannot hold on to the c4 pawn: White wins it back with e3 and the bishop. That is why the Queen's Gambit is not a real sacrifice.",
        },
      ],
    },
    sugsvang: {
      title: "Zugzwang",
      summary: "When having to move hurts.",
      steps: [
        {
          text: "Zugzwang is a position where having to move is a disadvantage: every move makes things worse, but you cannot pass. In the endgame zugzwang often decides the game.",
        },
        {
          text: "The black king is blocking the pawn. Put it in zugzwang.",
          hint: "Place your king so that the black king can only go to c7.",
          success: "Zugzwang! The black king must go to c7, the white king goes to e7 and the pawn becomes a queen.",
        },
        {
          text: "In which phase of the game is zugzwang most common?",
          options: ["In the endgame", "In the opening"],
          explanation:
            "In the endgame there are few pieces, so useful waiting moves run out quickly and every move matters.",
        },
        { text: "Solve zugzwang puzzles." },
      ],
    },
    "ikki-fil-bilan-mat": {
      title: "Mate with two bishops",
      summary: "The bishops build a wall, the king helps.",
      steps: [
        {
          text: "Two bishops can mate a lone king. The bishops stand on neighbouring diagonals and build a “wall”, and the king protects them. Drive the enemy king to the edge, then to a corner, and mate it there.",
        },
        {
          text: "Be careful: if the enemy king has no moves and is not in check, it is stalemate. As you push the king towards the corner, count its moves every time.",
        },
        { text: "Mate with two bishops. The bot defends as well as it can." },
      ],
    },
    "opera-partiyasi": {
      title: "The Opera Game",
      summary: "Morphy's famous game: development and sacrifice.",
      steps: [
        {
          text: "In 1858, at the Paris Opera, Paul Morphy played against two amateurs who consulted each other. The game is the best example of quick development, an open file and sacrifice. After 9 moves all of Morphy's pieces are in play, while the black king is still in the centre.",
        },
        {
          text: "Open lines to the black king with a sacrifice!",
          hint: "The knight takes the pawn on b5. If the c6 pawn takes back, the bishop checks the black king.",
          success: "That is what Morphy played! Lines to the black king are opening.",
        },
        {
          text: "The black knight on d7 is pinned to the king and cannot move. Increase the pressure!",
          hint: "Take the knight on d7 with the rook. If Black takes back, the second rook comes to the d-file.",
          success: "Excellent! Morphy sacrificed the rook too, and then brought the second rook to d1.",
        },
        {
          text: "The finale: sacrifice the queen and mate in two moves.",
          hint: "The queen gives check on b8. Black can only take it with the knight.",
          success: "Queen sacrifice! The knight takes it and d8 is left undefended.",
        },
        {
          text: "Give mate!",
          hint: "The rook goes to d8, and the bishop on g5 covers e7.",
          success: "Mate! The famous Opera Game, over in 17 moves.",
        },
        {
          text: "What is the main lesson of the Opera Game?",
          options: [
            "When you are ahead in development, open the position with a sacrifice",
            "Bring the queen out early in the opening",
            "Material always matters most",
          ],
          explanation:
            "All of Morphy's pieces were in play, while Black's had barely moved. At such moments sacrifices make the attack decisive.",
        },
      ],
    },
    "fil-va-ot-bilan-mat": {
      title: "Mate with bishop and knight",
      summary: "The hardest of the basic mates.",
      steps: [
        {
          text: "Mate with bishop and knight is the hardest basic mate. Mate is only possible in a corner of the bishop's colour. Here the bishop moves on dark squares, so the mate happens in the a1 or h8 corner.",
        },
        {
          text: "The plan: all three pieces work together to drive the enemy king to the edge. If the king runs to the wrong corner, chase it along the edge towards the right one: the knight travels on a path shaped like the letter “W”, while the bishop and king cover the escape squares.",
        },
        {
          text: "If the bishop moves on light squares, in which corner is the mate?",
          options: ["a8 or h1", "a1 or h8"],
          explanation:
            "a8 and h1 are light squares. Mate is only possible in a corner of the colour the bishop controls.",
        },
        {
          text: "Mate with bishop and knight. The bot defends as well as it can. Take your time, but you must mate within 50 moves.",
        },
      ],
    },
    "sokin-yurish": {
      title: "Quiet moves",
      summary: "A strong move that neither checks nor captures.",
      steps: [
        {
          text: "A quiet move neither checks nor captures, yet it creates a strong threat or breaks the opponent's defence. Such moves are hard to find, because the eye usually looks only for forcing moves.",
        },
        {
          text: "When an attack seems to stall, ask: “Which enemy piece holds the defence together? How can I deflect it or cut it off?” Often the answer is a single quiet move.",
        },
        {
          text: "What should you do to find a quiet move?",
          options: [
            "Besides forcing moves, also look at moves that break the opponent's defence",
            "Look only at checks",
            "Play the first move you see",
          ],
          explanation:
            "When forcing moves do not work, look for a quiet move that limits the opponent's replies. Such moves are what set strong players apart.",
        },
        { text: "Solve quiet move puzzles." },
      ],
    },
    "vaqt-boshqaruvi": {
      title: "Time management",
      summary: "The clock is part of the game.",
      steps: [
        {
          text: "The clock is part of the game. Share out your time: play a familiar opening quickly and think longer in a complex middlegame.",
        },
        {
          text: "When to think long: when there are captures and sacrifices, when the plan changes, or when deciding whether to go into an endgame. Do not spend much time on simple, natural moves.",
        },
        {
          text: "You have 1 minute left, your opponent has 10. What do you do?",
          options: [
            "Play simple, safe moves quickly",
            "Look for the best move for a long time every move",
            "Risk a sacrifice",
          ],
          explanation:
            "In time trouble a safe move matters more than the best one. Keep your pieces defended, simplify the position and do not let your time run out.",
        },
        {
          text: "Why should you play the opening quickly?",
          options: [
            "To save time on familiar moves for the middlegame",
            "There are no mistakes in the opening",
          ],
          explanation:
            "In the opening you play moves you have prepared. The time you save is needed later, when the position gets complicated.",
        },
      ],
    },
    "tayyorgarlik-va-psixologiya": {
      title: "Preparation and psychology",
      summary: "Before, during and after the game.",
      steps: [
        {
          text: "Before an important game, study your opponent: which openings do they play? Choose positions you know well and your opponent finds uncomfortable.",
        },
        {
          text: "After a mistake, take a deep breath and judge the position again. One mistake is not yet a loss. Most games are lost not by the first mistake, but by the panic that follows it.",
        },
        {
          text: "After the game, analyse every game you play. Lost games are the best teachers: write down your mistakes and solve puzzles on those themes.",
        },
        {
          text: "You made a blunder. What is the right thing to do?",
          options: [
            "Calm down and look for the best plan in the new position",
            "Resign at once",
            "Move quickly and forget the mistake",
          ],
          explanation:
            "The position has changed — look at it afresh. Your opponent can also make mistakes, so put up the stiffest resistance.",
        },
        {
          text: "What should you watch out for in a winning position?",
          options: ["Relaxing and forgetting the opponent's threats", "Trading pieces"],
          explanation:
            "In a better position many players relax and miss the opponent's chances. Keep checking the opponent's threats on every move.",
        },
      ],
    },
  },
};
