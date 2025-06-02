import { Outlet, useParams } from "react-router-dom";
import { KanbanBoard, Header } from "../components";
import { useGetBoardQuery } from "../api";
import { LoadingScreen, ErrorScreen } from "@shared";
import { getErrorMessage } from "@utils";
import { useState } from "react";

const BoardPage = () => {
  const { boardId: id } = useParams<{ boardId: string }>();
  const boardId = Number(id);
  const { data: board, isLoading, error } = useGetBoardQuery(boardId);
  const [searchQuery, setSearchQuery] = useState("");

  if (isLoading) return <LoadingScreen />;
  if (error) return <ErrorScreen title="Board Loading Failed" message={getErrorMessage(error)} type="warning" />;
  if (!board)
    return <ErrorScreen title="Board not found" message="The board you requested does not exist." type="notfound" />;

  return (
    <div className="flex flex-col h-screen">
      <Header onSearch={setSearchQuery} backTo="/boards" showBackButton />
      <KanbanBoard board={board} boardId={board.id} searchQuery={searchQuery} />
      <Outlet context={{ board }} />
    </div>
  );
};

export default BoardPage;
