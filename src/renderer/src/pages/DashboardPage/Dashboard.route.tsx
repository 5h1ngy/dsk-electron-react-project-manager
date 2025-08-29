import { ActionFunction, LoaderFunction } from "react-router-dom";

import { withDynamicPages } from "../../hocs/withDynamicImport";

export const loader: LoaderFunction | undefined =
    async () => null;

export const action: ActionFunction | undefined =
    undefined;

export const element: React.ReactElement =
    withDynamicPages({ pageName: 'Home', loader: <></> })