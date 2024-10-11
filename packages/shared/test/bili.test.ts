import { expect, describe, it } from "vitest";
import { parseDesc, formatOptions } from "../src/task/bili";

import type { BiliupConfig } from "@biliLive-tools/types";

describe.concurrent("parseDesc", () => {
  it("应该有艾特", () => {
    const input = "Hello [World]<123>! This is a [test]<456>.";
    const expected = [
      { raw_text: "Hello ", type: 1, biz_id: "" },
      { raw_text: "World", type: 2, biz_id: "123" },
      { raw_text: "! This is a ", type: 1, biz_id: "" },
      { raw_text: "test", type: 2, biz_id: "456" },
      { raw_text: ".", type: 1, biz_id: "" },
    ];

    const result = parseDesc(input);

    expect(result).toEqual(expected);
  });
  it("应该有艾特，更复杂的格式", () => {
    const input = "大家好，我是[暮色312]<10995238>\n，你是[皮皮]<3333>十[]是<>";
    const expected = [
      { raw_text: "大家好，我是", type: 1, biz_id: "" },
      { raw_text: "暮色312", type: 2, biz_id: "10995238" },
      { raw_text: "\n，你是", type: 1, biz_id: "" },
      { raw_text: "皮皮", type: 2, biz_id: "3333" },
      { raw_text: "十[]是<>", type: 1, biz_id: "" },
    ];

    const result = parseDesc(input);

    expect(result).toEqual(expected);
  });

  it("应该为空", () => {
    const input = "";
    const expected = [];

    const result = parseDesc(input);

    expect(result).toEqual(expected);
  });

  it("应该没有艾特", () => {
    const input = "你好，我是简介";
    const expected = [{ raw_text: "你好，我是简介", type: 1, biz_id: "" }];

    const result = parseDesc(input);

    expect(result).toEqual(expected);
  });
  // Add more test cases as needed
});

describe("formatOptions", () => {
  it("should format options without desc_v2", () => {
    const options: BiliupConfig = {
      cover: "http://example.com/cover.jpg",
      title: "Test Video",
      tid: 123,
      tag: ["tag1", "tag2"],
      desc: "This is a test video",
      dolby: 1,
      noReprint: 1,
      closeDanmu: 0,
      closeReply: 0,
      selectiionReply: 0,
      openElec: 1,
      recreate: 1,
      no_disturbance: 1,
      copyright: 1,
      hires: 0,
    };

    const expected = {
      cover: "http://example.com/cover.jpg",
      title: "Test Video",
      tid: 123,
      tag: "tag1,tag2",
      desc: "This is a test video",
      desc_v2: undefined,
      dolby: 1,
      is_only_self: 0,
      mission_id: undefined,
      topic_id: undefined,
      lossless_music: 0,
      no_reprint: 1,
      up_close_danmu: false,
      up_close_reply: false,
      up_selection_reply: false,
      open_elec: 1,
      recreate: 1,
      source: undefined,
      no_disturbance: 1,
      copyright: 1,
    };

    const result = formatOptions(options);

    expect(result).toEqual(expected);
  });

  it("should format options with desc_v2", () => {
    const options: BiliupConfig = {
      cover: "http://example.com/cover.jpg",
      title: "Test Video",
      tid: 123,
      tag: ["tag1", "tag2"],
      desc: "Hello [World]<123>! This is a [test]<456>.",
      dolby: 0,
      noReprint: 1,
      closeDanmu: 0,
      closeReply: 0,
      openElec: 0,
      recreate: -1,
      no_disturbance: 0,
      copyright: 1,
      hires: 0,
    };

    const expected = {
      copyright: 1,
      cover: "http://example.com/cover.jpg",
      title: "Test Video",
      tid: 123,
      tag: "tag1,tag2",
      desc: "Hello @World ! This is a @test .",
      desc_v2: [
        { raw_text: "Hello ", type: 1, biz_id: "" },
        { raw_text: "World", type: 2, biz_id: "123" },
        { raw_text: "! This is a ", type: 1, biz_id: "" },
        { raw_text: "test", type: 2, biz_id: "456" },
        { raw_text: ".", type: 1, biz_id: "" },
      ],
      dolby: 0,
      lossless_music: 0,
      no_reprint: 1,
      up_close_danmu: false,
      up_close_reply: false,
      up_selection_reply: false,
      open_elec: 0,
      recreate: -1,
      source: undefined,
      no_disturbance: 0,
      is_only_self: 0,
      mission_id: undefined,
      topic_id: undefined,
    };

    const result = formatOptions(options);

    expect(result).toEqual(expected);
  });
  it("should format options with topic_name", () => {
    const options: BiliupConfig = {
      cover: "http://example.com/cover.jpg",
      title: "Test Video",
      tid: 123,
      tag: ["tag1", "tag2"],
      desc: "This is a test video",
      dolby: 1,
      noReprint: 1,
      closeDanmu: 0,
      closeReply: 0,
      selectiionReply: 0,
      openElec: 1,
      recreate: 1,
      no_disturbance: 1,
      copyright: 1,
      hires: 0,
      topic_name: "Test Topic",
      topic_id: 123456,
      mission_id: 123456,
    };

    const expected = {
      cover: "http://example.com/cover.jpg",
      title: "Test Video",
      tid: 123,
      tag: "Test Topic,tag1,tag2",
      desc: "This is a test video",
      desc_v2: undefined,
      dolby: 1,
      lossless_music: 0,
      no_reprint: 1,
      up_close_danmu: false,
      up_close_reply: false,
      up_selection_reply: false,
      open_elec: 1,
      recreate: 1,
      source: undefined,
      no_disturbance: 1,
      copyright: 1,
      topic_id: 123456,
      mission_id: 123456,
      is_only_self: 0,
    };

    const result = formatOptions(options);

    expect(result).toEqual(expected);
  });
  it("should format options with topic_name and tag length equal 10", () => {
    const options: BiliupConfig = {
      cover: "http://example.com/cover.jpg",
      title: "Test Video",
      tid: 123,
      tag: ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7", "tag8", "tag9", "tag10"],
      desc: "This is a test video",
      dolby: 1,
      noReprint: 1,
      closeDanmu: 0,
      closeReply: 0,
      selectiionReply: 0,
      openElec: 1,
      recreate: 1,
      no_disturbance: 1,
      copyright: 1,
      hires: 0,
      topic_name: "Test Topic",
      topic_id: 123456,
      mission_id: 123456,
    };

    const expected = {
      cover: "http://example.com/cover.jpg",
      title: "Test Video",
      tid: 123,
      tag: "Test Topic,tag1,tag2,tag3,tag4,tag5,tag6,tag7,tag8,tag9",
      desc: "This is a test video",
      desc_v2: undefined,
      dolby: 1,
      lossless_music: 0,
      no_reprint: 1,
      up_close_danmu: false,
      up_close_reply: false,
      up_selection_reply: false,
      open_elec: 1,
      recreate: 1,
      source: undefined,
      no_disturbance: 1,
      copyright: 1,
      topic_id: 123456,
      mission_id: 123456,
      is_only_self: 0,
    };

    const result = formatOptions(options);

    expect(result).toEqual(expected);
  });
});
