import React from "react";

// components

import CardStats from "components/Cards/CardStats.js";

export default function HeaderStats() {
  return (
    <>
      {/* Header */}
      <div className="relative bg-blueGray-800 pt-20 pb-4">
        <div className="px-4 md:px-10 mx-auto w-full">
        <h2 className="text-2xl text-white">Submitted Products for Approval</h2>
        </div>
      </div>
    </>
  );
}
