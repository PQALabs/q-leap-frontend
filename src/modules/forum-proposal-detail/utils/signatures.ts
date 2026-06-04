import { keccak256, stringToHex } from 'viem';

const FORUM_COMMENT_SIGNATURE_PREFIX = 'QLEAP:CREATE_COMMENT';
const FORUM_UPVOTE_SIGNATURE_PREFIX = 'QLEAP:UPVOTE_COMMENT';
const FORUM_DELETE_COMMENT_SIGNATURE_PREFIX = 'QLEAP:DELETE_COMMENT';
const FORUM_EDIT_COMMENT_SIGNATURE_PREFIX = 'QLEAP:EDIT_COMMENT';
const FORUM_REPORT_COMMENT_SIGNATURE_PREFIX = 'QLEAP:REPORT_COMMENT';
const FORUM_PIN_COMMENT_SIGNATURE_PREFIX = 'QLEAP:PIN_COMMENT';
const FORUM_UNPIN_COMMENT_SIGNATURE_PREFIX = 'QLEAP:UNPIN_COMMENT';

type CommentSignatureParams = {
  proposalId: string;
  commentId: string;
  signatureTimestamp: number;
};

type ContentSignatureParams = CommentSignatureParams & {
  contentMarkdown: string;
};

type CreateCommentSignatureParams = Omit<ContentSignatureParams, 'commentId'> & {
  parentCommentId?: string;
};

export function getCommentContentHash(contentMarkdown: string) {
  return keccak256(stringToHex(contentMarkdown.trim()));
}

export function buildCreateCommentSignatureMessage({
  proposalId,
  parentCommentId,
  contentMarkdown,
  signatureTimestamp,
}: CreateCommentSignatureParams) {
  return [
    FORUM_COMMENT_SIGNATURE_PREFIX,
    `proposalId:${proposalId}`,
    `parentCommentId:${parentCommentId ?? 'root'}`,
    `contentHash:${getCommentContentHash(contentMarkdown)}`,
    `timestamp:${signatureTimestamp}`,
  ].join('\n');
}

export function buildEditCommentSignatureMessage({
  proposalId,
  commentId,
  contentMarkdown,
  signatureTimestamp,
}: ContentSignatureParams) {
  return [
    FORUM_EDIT_COMMENT_SIGNATURE_PREFIX,
    `proposalId:${proposalId}`,
    `commentId:${commentId}`,
    `contentHash:${getCommentContentHash(contentMarkdown)}`,
    `timestamp:${signatureTimestamp}`,
  ].join('\n');
}

export function buildDeleteCommentSignatureMessage({
  proposalId,
  commentId,
  signatureTimestamp,
}: CommentSignatureParams) {
  return [
    FORUM_DELETE_COMMENT_SIGNATURE_PREFIX,
    `proposalId:${proposalId}`,
    `commentId:${commentId}`,
    `timestamp:${signatureTimestamp}`,
  ].join('\n');
}

export function buildUpvoteCommentSignatureMessage({
  proposalId,
  commentId,
  signatureTimestamp,
}: CommentSignatureParams) {
  return [
    FORUM_UPVOTE_SIGNATURE_PREFIX,
    `proposalId:${proposalId}`,
    `commentId:${commentId}`,
    `timestamp:${signatureTimestamp}`,
  ].join('\n');
}

export function buildPinCommentSignatureMessage({ proposalId, commentId, signatureTimestamp }: CommentSignatureParams) {
  return [
    FORUM_PIN_COMMENT_SIGNATURE_PREFIX,
    `proposalId:${proposalId}`,
    `commentId:${commentId}`,
    `timestamp:${signatureTimestamp}`,
  ].join('\n');
}

export function buildUnpinCommentSignatureMessage({
  proposalId,
  commentId,
  signatureTimestamp,
}: CommentSignatureParams) {
  return [
    FORUM_UNPIN_COMMENT_SIGNATURE_PREFIX,
    `proposalId:${proposalId}`,
    `commentId:${commentId}`,
    `timestamp:${signatureTimestamp}`,
  ].join('\n');
}

type ReportCommentSignatureParams = CommentSignatureParams & {
  reason: string;
};

export function buildReportCommentSignatureMessage({
  proposalId,
  commentId,
  reason,
  signatureTimestamp,
}: ReportCommentSignatureParams) {
  const reasonHash = keccak256(stringToHex(reason));
  return [
    FORUM_REPORT_COMMENT_SIGNATURE_PREFIX,
    `proposalId:${proposalId}`,
    `commentId:${commentId}`,
    `reasonHash:${reasonHash}`,
    `timestamp:${signatureTimestamp}`,
  ].join('\n');
}
