const hasMongoScheme = (value) => {
  return typeof value === "string" && /^mongodb(\+srv)?:\/\//.test(value);
};

const normalizeMongoUri = (rawUri, databaseName = "") => {
  if (!hasMongoScheme(rawUri)) {
    throw new Error("MONGO_URI must start with mongodb:// or mongodb+srv://");
  }

  const url = new URL(rawUri);
  const trimmedDatabaseName = databaseName.trim();

  if (!url.pathname || url.pathname === "/") {
    if (trimmedDatabaseName) {
      url.pathname = `/${trimmedDatabaseName}`;
    }
  }

  return url.toString();
};

export default normalizeMongoUri;
