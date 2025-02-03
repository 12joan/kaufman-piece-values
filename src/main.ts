type SourceOfTruth = 'article' | 'lesson';

type ColorString = 'white' | 'black';
type ColorNumber =
  | 1 // White
  | 2; // Black

type Piece =
  | 'b' // Bishop
  | 'n' // Knight
  | 'p' // Pawn
  | 'q' // Queen
  | 'r' // Rook
  | 'k'; // King

interface MaterialForColor extends Record<Piece, number> {
  count: number;
}

interface Material extends Record<ColorString, MaterialForColor> {
  imbalance: number;
}

interface PieceData {
  type: Piece;
  color: ColorNumber;
  promoted: boolean;
  square: string; // E.g. 'a1'
}

type PiecesData = Record<string, PieceData>;

interface Game {
  _processedByKaufmanExt?: true;
  getMaterial: () => Material;
  getPieces: () => {
    getCollection: () => PiecesData;
  };
  reload: () => void;
}

const main = () => {
  /**
   * Kaufman's article "The Evaluation of Material Imbalances" differs slightly
   * from his lesson on Chess.com in some regards.
   *
   * Unpaired bishops:
   *   Article: 3.25
   *   Lesson: 3.5
   *
   * Rook pawns:
   *   Article: 1
   *   Lesson: 0.75
   *
   * Bishop pair:
   *   Article: 0.5 (0.25 each)
   *   Lesson: 0.25 (0.125 each) - This is presented ambiguously
   *
   * Change the constant below to switch between these sources of truth.
   */
  const SOURCE_OF_TRUTH = 'lesson' as SourceOfTruth;

  const baseScores: Record<Piece, number> = {
    b: {
      article: 3.25,
      lesson: 3.5,
    }[SOURCE_OF_TRUTH],
    n: 3.25,
    p: 1,
    q: 9.75,
    r: 5,
    k: 0,
  };

  const scoreForPiece = (
    { type, square }: PieceData,
    bothBishops: boolean
  ): number => {
    const baseScore = baseScores[type];
    const isLesson = SOURCE_OF_TRUTH === 'lesson';

    const bothBishopsBonus = bothBishops && type === 'b'
      ? { article: 0.25, lesson: 0.125 }[SOURCE_OF_TRUTH]
      : 0;

    const file = square[0];
    const isEdge = file === 'a' || file === 'h';
    const edgePawnPenalty = isLesson && type === 'p' && isEdge ? -0.25 : 0;

    return baseScore + bothBishopsBonus + edgePawnPenalty;
  };

  const processGame = (game: Game) => {
    // Only process each `game` object once
    if (game._processedByKaufmanExt) return;
    game._processedByKaufmanExt = true;

    // New logic to get the imbalance for the current game
    const getImbalance = (): number => {
      const pieces = Object.values(game.getPieces().getCollection());

      const bishops = pieces.filter(({ type }) => type === 'b');
      const whiteBothBishops = bishops.filter(({ color }) => color === 1).length >= 2;
      const blackBothBishops = bishops.filter(({ color }) => color === 2).length >= 2;

      // Positive means White has better material
      let imbalance = 0;

      pieces.forEach((piece) => {
        const isWhite = piece.color === 1;
        const sign = isWhite ? 1 : -1;
        const bothBishops = isWhite ? whiteBothBishops : blackBothBishops;
        imbalance += scoreForPiece(piece, bothBishops) * sign;
      });

      return imbalance;
    };

    const { getMaterial } = game;

    // Change how the `imbalance` property returned by `getMaterial` is calculated
    game.getMaterial = () => ({
      ...getMaterial(),
      imbalance: getImbalance(),
    });

    // Apply the new `getMaterial` logic immediately
    game.reload();
  };

  // Override the `game` object for each board when it's added to the DOM
  const processAllBoards = () => {
    document.querySelectorAll('wc-chess-board').forEach((board) => {
      if ('game' in board) {
        processGame(board.game as Game);
      }
    });
  };

  const observer = new MutationObserver(processAllBoards);

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  processAllBoards();
};

/**
 * The `game` property is not accessible from the content script directly, so
 * retrieve it using a <script> element appended to the body.
 */
const script = document.createElement('script');
script.innerText = '(' + main.toString() + ')()';
document.body.append(script);
