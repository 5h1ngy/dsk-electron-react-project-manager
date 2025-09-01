import { ActionFunction, LoaderFunction } from "react-router-dom";
import TaskBoardPage from "./TaskBoard.component";

export const loader: LoaderFunction | undefined =
    async () => null;

export const action: ActionFunction | undefined =
    undefined;

export const element: React.ReactElement = <TaskBoardPage />;