import { ActionFunction, LoaderFunction } from "react-router-dom";

import Loading from "@/layouts/Loading"

import store from "@/store";
import { asyncActions } from "@/store";
import { withDynamicPages } from "@/hocs/withDynamicImport";

export const loader: LoaderFunction | undefined =
    async () => {
        await store.dispatch(asyncActions.portfolioAsyncActions.doGetRepositories());
        await store.dispatch(asyncActions.portfolioAsyncActions.doGetAbout());
        await store.dispatch(asyncActions.portfolioAsyncActions.doGetHardskill());
        await store.dispatch(asyncActions.portfolioAsyncActions.doGetSoftskill());
        await store.dispatch(asyncActions.portfolioAsyncActions.doGetContacts());
        return null;
    };

export const action: ActionFunction | undefined =
    undefined;

export const element: React.ReactElement =
    withDynamicPages({ pageName: 'Home', loader: <Loading /> })