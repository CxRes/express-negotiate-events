/*!
 *  Copyright (c) 2024, Rahul Gupta and Express Negotiate Events contributors.
 *
 *  This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this
 *  file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 *  SPDX-License-Identifier: MPL-2.0
 */
import { describe, it, expect, beforeEach, vi } from "vitest";

import negotiateEvents from "./index.js";
// eslint-disable-next-line no-unused-vars
import { serializeDictionary } from "structured-headers";

vi.mock("structured-headers", () => ({
  serializeDictionary: vi.fn().mockReturnValue("serialized"),
}));

describe("Express Negotiate Events", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      path: "/test-path",
    };
    res = {
      events: {
        protocol1: {
          configure: vi.fn().mockReturnValue(),
          send: vi.fn(),
        },
        protocol2: {
          configure: vi.fn().mockReturnValue(),
          send: vi.fn(),
        },
      },
      setHeader: vi.fn(),
    };
    next = vi.fn();
  });

  it("should attach a `sendEvents()` function to the response object", () => {
    negotiateEvents(req, res, next);
    expect(typeof res.sendEvents).toBe("function");
    expect(next).toHaveBeenCalled();
  });

  it("should return the first error when it fails to configure any protocol", () => {
    negotiateEvents(req, res, next);
    req.acceptEvents = [[]];
    res.events.protocol1.configure.mockReturnValue("error1");
    res.events.protocol2.configure.mockReturnValue("error2");
    const failStatus = res.sendEvents({
      config: {
        protocol1: "",
        protocol2: "",
      },
    });
    expect(failStatus).toEqual("error1");
  });

  it("should set the events header and return the first error when it fails to send events on any protocol", () => {
    negotiateEvents(req, res, next);
    res.events.protocol1.configure.mockReturnValue();
    res.events.protocol1.config = true;
    res.events.protocol1.send.mockReturnValue("error");
    req.acceptEvents = [["protocol1", { key: "value" }]];
    const failStatus = res.sendEvents({
      config: { protocol1: "" },
    });
    expect(res.setHeader).toHaveBeenCalledWith("Events", "serialized");
    expect(failStatus).toEqual("error");
  });

  it("should return failure true when there is no `Accept-Events` header is defined", () => {
    negotiateEvents(req, res, next);
    res.events.protocol1.configure.mockReturnValue();
    res.events.protocol1.config = true;
    const failStatus = res.sendEvents({
      config: { protocol1: "" },
    });
    expect(failStatus).toBe(true);
  });

  it("should return failure true when none of the requested protocols matches the configured protocols", () => {
    negotiateEvents(req, res, next);
    res.events.protocol1.configure.mockReturnValue();
    res.events.protocol1.config = true;
    req.acceptEvents = [["protocolX", new Map([["key", "value"]])]];
    const failStatus = res.sendEvents({
      config: { protocol1: "" },
    });
    expect(failStatus).toBe(true);
  });

  it("should return void when events are successfully sent", () => {
    negotiateEvents(req, res, next);
    res.events.protocol1.configure.mockReturnValue();
    res.events.protocol1.config = true;
    res.events.protocol1.send.mockReturnValue();
    req.acceptEvents = [["protocol1", { key: "value" }]];
    const failStatus = res.sendEvents({
      body: "something",
      config: { protocol1: "" },
      modifiers: { protocol1: {} },
    });
    expect(failStatus).toBeUndefined();
  });
});
