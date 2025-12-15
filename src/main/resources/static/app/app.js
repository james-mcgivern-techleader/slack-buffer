(function () {
  const e = React.createElement;

  function App() {
    return e(
      "div",
      { className: "container" },
      e("h1", null, "slack-buffer"),
      e(
        "p",
        { className: "muted" },
        "Web UI skeleton is running. Slack events endpoint is /slack/events."
      )
    );
  }

  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(e(App));
})();
