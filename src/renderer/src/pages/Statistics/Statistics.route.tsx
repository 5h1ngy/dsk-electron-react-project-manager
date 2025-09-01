import { ActionFunction, LoaderFunction } from "react-router-dom";
import SettingsPage from "./Statistics.component";

export const loader: LoaderFunction | undefined =
    async () => null;

export const action: ActionFunction | undefined =
    undefined;

export const element: React.ReactElement = <SettingsPage />;