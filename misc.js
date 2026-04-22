/**
 * ═══════════════════════════════════════════════════
 *  Lune D'Or — /api/stats  &  /api/delivery Router
 * ═══════════════════════════════════════════════════
 */

const router       = require("express").Router();
const store        = require("../data/store");
const { respond, requireAuth } = require("../middleware");

// ── Delivery zone table (mirrors the frontend) ────
const YALIDINE_ZONES = {
  0: { domicile: 500,  bureau: 300  },
  1: { domicile: 750,  bureau: 350  },
  2: { domicile: 900,  bureau: 400  },
  3: { domicile: 1050, bureau: 600  },
  4: { domicile: 1400, bureau: 800  },
  5: { domicile: 1600, bureau: 1000 },
};
const WILAYA_ZONE = {
  1:4, 2:1, 3:3, 4:1, 5:2, 6:2, 7:3, 8:4, 9:2, 10:2,
  11:4,12:1,13:2,14:2,15:2,16:1,17:3,18:2,19:2,20:2,
  21:1,22:2,23:2,24:1,25:0,26:2,27:2,28:2,29:2,30:3,
  31:2,32:3,33:3,34:2,35:2,36:2,37:3,38:2,39:3,40:2,
  41:2,42:2,43:1,44:2,45:4,46:2,47:3,48:2,49:4,50:4,
  51:3,52:4,53:4,54:4,55:3,56:4,57:3,58:3,
};

// ── GET /api/stats  [🔒] ──────────────────────────
router.get("/stats", requireAuth, (req, res) => {
  respond.ok(res, store.getStats());
});

// ── GET /api/delivery?wilaya=16&type=domicile  [public] ──
router.get("/delivery", (req, res) => {
  const { wilaya, type = "domicile" } = req.query;
  if (!wilaya) return respond.badReq(res, "wilaya query param required (e.g. ?wilaya=16)");
  if (!["domicile","bureau"].includes(type))
    return respond.badReq(res, "type must be 'domicile' or 'bureau'");

  const num  = parseInt(wilaya);
  if (isNaN(num) || num < 1 || num > 58)
    return respond.badReq(res, "wilaya must be a number between 1 and 58");

  const zone   = WILAYA_ZONE[num] ?? 2;
  const tarifs = YALIDINE_ZONES[zone];
  respond.ok(res, {
    wilaya: num,
    zone,
    domicile: tarifs.domicile,
    bureau:   tarifs.bureau,
    selected: tarifs[type],
    selectedType: type,
  });
});

module.exports = router;
