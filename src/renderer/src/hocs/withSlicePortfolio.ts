import { connect, ConnectedProps } from "react-redux";
import { bindActionCreators } from "redux";

import { RootState, RootDispatch } from '../store';
import { rootActions } from '../store';

const mapStateToProps = (state: RootState) => ({
    ...state.auth,
})

const mapDispatchToProps = (dispatch: RootDispatch) => ({
    ...bindActionCreators(rootActions.authActions, dispatch),
})

const bind = connect(mapStateToProps, mapDispatchToProps, (stateProps, dispatchProps, ownProps) => ({
    state: stateProps,
    actions: dispatchProps,
    ...ownProps,
}));

export const withContainer = bind

export type Bind = ConnectedProps<typeof bind>