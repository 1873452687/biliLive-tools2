import { streamerModel, recordHistoryModel } from "../db/index.js";

import type { BaseLive, Live } from "../db/model/recordHistory.js";
import type { BaseStreamer } from "../db/model/streamer.js";

export interface QueryRecordsOptions {
  room_id: string;
  platform: string;
  page?: number;
  pageSize?: number;
  startTime?: number;
  endTime?: number;
}

export interface QueryRecordsResult {
  data: Array<Live>;
  pagination: {
    total: number;
    page: number;
    pageSize: number;
  };
}

export function addWithStreamer(data: Omit<BaseLive, "streamer_id"> & BaseStreamer) {
  const streamer = streamerModel.upsert({
    where: {
      room_id: data.room_id,
      platform: data.platform,
    },
    create: {
      name: data.name,
      room_id: data.room_id,
      platform: data.platform,
    },
  });
  if (!streamer) return null;

  const live = recordHistoryModel.add({
    title: data.title,
    streamer_id: streamer.id,
    live_start_time: data.live_start_time,
    record_start_time: data.record_start_time,
    video_file: data.video_file,
    live_id: data.live_id,
  });
  return live;
}

export function upadteLive(
  query: { video_file: string; live_id?: string },
  params: {
    record_end_time?: number;
    video_duration?: number;
    danma_num?: number;
    interact_num?: number;
  },
) {
  const live = recordHistoryModel.query({ video_file: query.video_file, live_id: query.live_id });
  if (live) {
    recordHistoryModel.update({
      id: live.id,
      ...params,
    });
    return {
      ...live,
      ...params,
    };
  }

  return null;
}

export function queryRecordsByRoomAndPlatform(options: QueryRecordsOptions): QueryRecordsResult {
  const { room_id, platform, page = 1, pageSize = 100, startTime, endTime } = options;

  // 先查询streamer
  const streamer = streamerModel.query({ room_id, platform });
  if (!streamer) {
    return {
      data: [],
      pagination: {
        total: 0,
        page,
        pageSize,
      },
    };
  }

  // 使用数据库分页而不是内存分页
  const result = recordHistoryModel.paginate({
    where: { streamer_id: streamer.id },
    page,
    pageSize,
    startTime,
    endTime,
    orderBy: "id",
    orderDirection: "DESC",
  });

  return {
    data: result.data,
    pagination: {
      total: result.total,
      page,
      pageSize,
    },
  };
}

export async function removeRecords(channelId: string, providerId: string) {
  // 查找主播ID
  const streamer = streamerModel.query({
    room_id: channelId,
    platform: providerId,
  });
  if (!streamer) throw new Error("没有找到stream");

  recordHistoryModel.removeRecordsByStreamerId(streamer.id);

  return true;
}

export function getRecord(data: { file: string; live_id?: string }) {
  return recordHistoryModel.query({ video_file: data.file, live_id: data.live_id });
}

export function getRecordById(id: number) {
  return recordHistoryModel.query({ id });
}

export function removeRecord(id: number): boolean {
  const deletedCount = recordHistoryModel.removeRecord(id);
  return deletedCount > 0;
}

export default {
  addWithStreamer,
  upadteLive,
  queryRecordsByRoomAndPlatform,
  removeRecords,
  removeRecord,
  getRecord,
  getRecordById,
};
