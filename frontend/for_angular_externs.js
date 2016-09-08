/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @externs
 */


class DualDefer {
  /**
   * @param {function(!angular.$http.Response): ?} resolveCallback
   * @return {DualDefer}
   */
  onCacheFetched(resolveCallback) {}

  /**
   * @param {function(!angular.$http.Response): ?} resolveCallback
   * @param {(function(!angular.$http.Response): ?)=} opt_rejectCallback
   * @return {DualDefer}
   */
  onServerResponded(resolveCallback, opt_rejectCallback) {}

  /**
   * @param {function(!angular.$http.Response): ?} callback
   * @return {DualDefer}
   */
  finally(callback) {}
}


class DualHttpService {
  /**
   * @param {string} url
   * @param {angular.$http.Config=} opt_config
   * @return {!DualDefer}
   */
  get(url, opt_config) {}
}
