import { ActionFunction, LoaderFunction } from "react-router-dom";
import NotFoundPage from "./NotFound.component";

export const loader: LoaderFunction | undefined =
    async () => null;

export const action: ActionFunction | undefined =
    undefined;

export const element: React.ReactElement = <NotFoundPage />;