const user = `            
  "id" SERIAL,
  "userdata" TEXT,
  "subscriptions" TEXT[],
  "email" TEXT,
  PRIMARY KEY ("id")

`;

module.exports = { user };
