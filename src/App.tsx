/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CarPlayGame } from './components/CarPlayGame';

export default function App() {
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-slate-950 flex flex-col items-center justify-between select-none touch-none">
      <CarPlayGame />
    </div>
  );
}

