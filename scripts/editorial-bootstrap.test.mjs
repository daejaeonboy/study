import assert from "node:assert/strict";
import test from "node:test";

import {
  getBootstrapAdminDisplayName,
  getBootstrapAdminId,
  getInitialEditorialRole,
  isBootstrapAdminEmail,
  normalizeBootstrapAdminEmail,
} from "../src/lib/editorial-bootstrap.ts";

test("normalizes configured bootstrap admin emails", () => {
  assert.equal(normalizeBootstrapAdminEmail(" CryingOnion77@Gmail.com "), "cryingonion77@gmail.com");
  assert.equal(normalizeBootstrapAdminEmail(""), null);
  assert.equal(normalizeBootstrapAdminEmail(null), null);
});

test("detects bootstrap admin email case-insensitively", () => {
  assert.equal(
    isBootstrapAdminEmail("CRYINGONION77@gmail.com", "cryingonion77@gmail.com"),
    true,
  );
  assert.equal(isBootstrapAdminEmail("other@example.com", "cryingonion77@gmail.com"), false);
  assert.equal(isBootstrapAdminEmail("cryingonion77@gmail.com", null), false);
});

test("promotes configured bootstrap admin even when seed users already exist", () => {
  assert.equal(
    getInitialEditorialRole({
      existingUserCount: 3,
      email: "cryingonion77@gmail.com",
      bootstrapAdminEmail: "cryingonion77@gmail.com",
    }),
    "admin",
  );
  assert.equal(
    getInitialEditorialRole({
      existingUserCount: 3,
      email: "new-editor@example.com",
      bootstrapAdminEmail: "cryingonion77@gmail.com",
    }),
    "editor",
  );
  assert.equal(
    getInitialEditorialRole({
      existingUserCount: 0,
      email: "new-editor@example.com",
      bootstrapAdminEmail: "cryingonion77@gmail.com",
    }),
    "admin",
  );
});

test("uses stable bootstrap admin row defaults", () => {
  assert.equal(getBootstrapAdminId(), "bootstrap-admin");
  assert.equal(getBootstrapAdminDisplayName("cryingonion77@gmail.com"), "cryingonion77");
  assert.equal(getBootstrapAdminDisplayName("cryingonion77@gmail.com", "Main Admin"), "Main Admin");
});
