(function (window) {
  if (window["ENV"]) return;

  Object.defineProperty(window, "ENV", {
    configurable: false,
    enumerable: false,
    writable: false,
    value: {},
  });

  const env = {
    app: "AstraLabel Core",
    env: "${ENV}",
    ptp: {
      host: "${PTP__HOST}",
      protocol: "${PTP__PROTOCOL}",
    },
    keycloak: {
      host: "${KEYCLOAK__HOST}",
      protocol: "${KEYCLOAK__HOST_PROTOCOL}",
      client_id: "${KEYCLOAK__CLIENT_ID}",
      realm: "${KEYCLOAK__REALM}",
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
