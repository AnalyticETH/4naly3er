import { Issue } from '../types';

import shiftInsteadOfDiv from './GAS/shiftInsteadOfDiv';
import unsignedComparison from './GAS/unsignedComparison';
import initializeDefaultValue from './GAS/initializeDefaultValue';
import addressZero from './GAS/addressZero';
import boolIncursOverhead from './GAS/boolIncursOverhead';
import uselessInternal from './GAS/uselessInternal';
import longRevertString from './GAS/longRevertString';
import privateForConstants from './GAS/privateForConstants';
import cacheArrayLength from './GAS/cacheArrayLength';
import payableFunctions from './GAS/payableFunctions';
import customErrors from './GAS/customErrors';
import addressBalance from './GAS/addressBalance';
import splitRequireStatement from './GAS/splitRequireStatement';
import canUseUnchecked from './GAS/canUseUnchecked';
import cacheVariable from './GAS/cacheVariable';
import calldataViewFunctions from './GAS/calldataViewFunctions';
import assignUpdateArray from './GAS/assignUpdateArray';
import postIncrement from './GAS/postIncrement';
import delegateCallInLoop from './H/delegateCallInLoop';
import unindexedEvent from './NC/unindexedEvent';
import address0Check from './NC/address0Check';
import useConstants from './NC/useConstants';
import uselessPublic from './NC/uselessPublic';
import todoLeftInTheCode from './NC/todoLeftInTheCode';
import returnValueOfApprove from './NC/returnValueOfApprove';
import nonReentrantBeforeModifiers from './NC/nonReentrantBeforeModifiers';
import requireWithString from './NC/requireWithString';
import solmateSafeTransferLib from './M/solmateSafeTransferLib';
import centralizationRisk from './M/centralizationRisk';
import supportsInterface from './M/supportsInterface';
import msgValueWithoutPayable from './M/msgValueWithoutPayable';
import avoidEncodePacked from './L/avoidEncodePacked';
import deprecatedFunctions from './L/deprecatedFunctions';
import unspecifiedPragma from './L/unspecifiedPragma';
import frontRunnableInitializer from './L/frontRunnableInitializer';
import unsafeERC20Operations from './L/unsafeERC20Operations';
import emptyBody from './L/emptyBody';

const issues: Issue[] = [
  shiftInsteadOfDiv,
  unsignedComparison,
  initializeDefaultValue,
  addressZero,
  boolIncursOverhead,
  uselessInternal,
  longRevertString,
  privateForConstants,
  cacheArrayLength,
  payableFunctions,
  customErrors,
  addressBalance,
  splitRequireStatement,
  canUseUnchecked,
  cacheVariable,
  calldataViewFunctions,
  assignUpdateArray,
  postIncrement,
  delegateCallInLoop,
  unindexedEvent,
  address0Check,
  useConstants,
  uselessPublic,
  todoLeftInTheCode,
  returnValueOfApprove,
  nonReentrantBeforeModifiers,
  requireWithString,
  solmateSafeTransferLib,
  supportsInterface,
  msgValueWithoutPayable,
  centralizationRisk,
  avoidEncodePacked,
  deprecatedFunctions,
  unspecifiedPragma,
  frontRunnableInitializer,
  unsafeERC20Operations,
  emptyBody,
];

export default issues;
