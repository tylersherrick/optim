import BoardCard, { NewBoardCard } from "../components/BoardCard.jsx";

export default function Home({
  boards,
  onSelectBoard,
  onNewBoard,
  onDeleteBoard,
}) {
  return (
    <div>
      <div className="main-header">
        <h1>Your projects</h1>
        <button className="btn-primary" onClick={onNewBoard}>
          + New board
        </button>
      </div>
      <div className="grid">
        {boards.map((board) => (
          <BoardCard
            key={board.id}
            board={board}
            onClick={() => onSelectBoard(board)}
            onDelete={onDeleteBoard}
          />
        ))}
        <NewBoardCard onClick={onNewBoard} />
      </div>
    </div>
  );
}
