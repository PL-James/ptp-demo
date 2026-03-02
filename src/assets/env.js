(function (window) {
  if (window["ENV"]) return;

  Object.defineProperty(window, "ENV", {
    configurable: false,
    enumerable: false,
    writable: false,
    value: {},
  });

  const env = {
    app: "EW Frontend",
    env: "demo",
    ptp: {
      host: "localhost:3000",
      protocol: "http",
    },
    keycloak: {
      host: "",
      protocol: "",
      client_id: "",
      realm: "",
    },
  };

  Object.entries(env).forEach(([key, val]) => {
    Object.defineProperty(window["ENV"], key, {
      configurable: false,
      enumerable: true,
      writable: false,
      value: val,
    });
  });
})(this);
