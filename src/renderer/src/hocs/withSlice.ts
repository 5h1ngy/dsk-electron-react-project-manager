import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { RootState, RootDispatch } from '../store';
import { rootActions } from '../store';

type BoundActions = {
    [K in keyof typeof rootActions]: {
        [A in keyof (typeof rootActions)[K]]:
        (typeof rootActions)[K][A] extends (...args: infer P) => infer R
        ? (...args: P) => R
        : never;
    };
};

export type Bind = {
    state: RootState;
    actions: BoundActions;
};

const mapStateToProps = (state: RootState) => ({ ...state });

const mapDispatchToProps = (dispatch: RootDispatch): BoundActions => {
    const entries = Object.entries(rootActions).map(([key, actions]) => [
        key,
        bindActionCreators(actions, dispatch)
    ]);
    return Object.fromEntries(entries) as BoundActions;
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
    (stateProps, dispatchProps, ownProps) => ({
        state: stateProps,
        actions: dispatchProps,
        ...ownProps,
    })
);