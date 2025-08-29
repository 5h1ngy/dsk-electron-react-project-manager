import { connect, ConnectedProps } from "react-redux";
import { bindActionCreators } from "redux";

import { RootState, Dispatch } from '../store';
import { actions } from '../store';

const mapStateToProps = (state: RootState) => ({
    ...state.auth,
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
    ...bindActionCreators(actions.authActions, dispatch),
})

const bind = connect(mapStateToProps, mapDispatchToProps, (stateProps, dispatchProps, ownProps) => ({
    state: stateProps,
    actions: dispatchProps,
    ...ownProps,
}));

export const withContainer = bind

export type Bind = ConnectedProps<typeof bind>