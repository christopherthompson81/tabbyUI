import * as React from "react";

const ReducerContext = React.createContext();

export function useReducerContext() {
    return React.useContext(ReducerContext);
}

export default ReducerContext;
