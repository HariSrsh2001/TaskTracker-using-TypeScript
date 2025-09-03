
// ✅ Import React core library (needed for JSX and components)
import React from "react";

// ✅ Import ReactDOM → this allows React to render into the actual browser DOM
import ReactDOM from "react-dom/client";

// ✅ Import the root App component (our main application component)
import App from "./App";

// ✅ React 18 way of starting the app
//    - find the <div id="root"></div> in index.html
//    - attach React "root" there
ReactDOM.createRoot(document.getElementById("root")!).render(
    // ✅ StrictMode is a development-only helper
    //    - warns about potential problems
    //    - doesn’t affect production
    <React.StrictMode>
        {/* ✅ Render our App component inside root */}
        <App />
    </React.StrictMode>
);

