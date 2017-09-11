'use strict';

const async_wrap = process.binding('async_wrap');
//const errors = require('internal/errors');
/* async_hook_fields is a Uint32Array wrapping the uint32_t array of
 * Environment::AsyncHooks::fields_[]. Each index tracks the number of active
 * hooks for each type.
 *
 * async_uid_fields is a Float64Array wrapping the double array of
 * Environment::AsyncHooks::uid_fields_[]. Each index contains the ids for the
 * various asynchronous states of the application. These are:
 *  kCurrentAsyncId: The async_id assigned to the resource responsible for the
 *    current execution stack.
 *  kCurrentTriggerId: The trigger_async_id of the resource responsible for the
 *    current execution stack.
 *  kAsyncUidCntr: Incremental counter tracking the next assigned async_id.
 *  kInitTriggerId: Written immediately before a resource's constructor that
 *    sets the value of the init()'s triggerAsyncId. The order of retrieving
 *    the triggerAsyncId value is passing directly to the constructor -> value
 *   set in kInitTriggerId -> executionAsyncId of the current resource.
 */
const { async_hook_fields, async_uid_fields } = async_wrap;

// Each constant tracks how many callbacks there are for any given step of
// async execution. These are tracked so if the user didn't include callbacks
// for a given step, that step can bail out early.
//const { kInit, kBefore, kAfter, kDestroy, kTotals, kCurrentAsyncId,
//        kCurrentTriggerId, kAsyncUidCntr,
//        kInitTriggerId } = async_wrap.constants;
//
// Symbols used to store the respective ids on both AsyncResource instances and
// internal resources. They will also be assigned to arbitrary objects passed
// in by the user that take place of internally constructed objects.
const { async_id_symbol, trigger_id_symbol } = async_wrap;


function emitDestroyScript(asyncId) {
  if (!Number.isSafeInteger(asyncId) || asyncId < -1) {
    fatalError(
      new errors.RangeError('ERR_INVALID_ASYNC_ID', 'asyncId', asyncId));
  }

  // Return early if there are no destroy callbacks, or invalid asyncId.
  if (async_hook_fields[kDestroy] === 0 || asyncId <= 0)
    return;
  async_wrap.addIdToDestroyList(asyncId);
}

// Placing all exports down here because the exported classes won't export
// otherwise.
module.exports = {
  emitDestroy: emitDestroyScript,
};
