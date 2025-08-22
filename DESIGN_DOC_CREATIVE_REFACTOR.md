# Creative Performance Component Refactor - Design Document

## 📋 Áttekintés
A Creative Performance komponens átstrukturálása, ahol szétválasztjuk a test type és platform type koncepciókat.

## 🎯 Célok
1. **Test Types** → Fő navigációs elemek (táblák közötti váltás)
2. **Platform Types** → Minden termék alatt megjelenő alcsoport
3. Platform-specifikus konfiguráció test type-onként
4. localStorage alapú adattárolás (később backend)

## 🏗️ Architektúra

### Jelenlegi struktúra
```
Product Table
  └── Test Types (dropdown minden termék alatt)
       └── Scores
```

### Új struktúra
```
Test Type Toggle (header)
  └── Product Table (kiválasztott test type)
       └── Platform Types (minden termék alatt)
            └── Scores
```

## 📊 Adatmodell

### localStorage struktúra
```javascript
{
  "creativeTestTypes": [
    {
      "id": "video-creative-test",
      "name": "Video Creative Test",
      "allowedPlatforms": ["meta", "tiktok", "youtube"],
      "order": 1
    },
    {
      "id": "static-creative-test", 
      "name": "Static Creative Test",
      "allowedPlatforms": ["meta"],
      "order": 2
    }
  ],
  
  "creativePlatformTypes": [
    { "id": "meta", "name": "Meta", "order": 1 },
    { "id": "tiktok", "name": "TikTok", "order": 2 },
    { "id": "youtube", "name": "YouTube", "order": 3 }
  ],
  
  "creativeScores": {
    "product-123": {
      "video-creative-test": {
        "meta": { score: 85, date: "2024-01-15" },
        "tiktok": { score: 92, date: "2024-01-16" }
      },
      "static-creative-test": {
        "meta": { score: 78, date: "2024-01-14" }
      }
    }
  }
}
```

## 🎨 UI Komponensek

### 1. Header Toggle Switch
- Hasonló az Analytics/Configuration switch-hez
- Test type-ok közötti váltás
- Vizuális jelzés az aktív test type-ról

### 2. Product Table
- Egy tábla látszik egyszerre
- Oszlopok: Product Name, Platform Types, Score, Actions
- Platform types expandable minden termék alatt

### 3. Right Sidebar Configuration
- Test Types Management
  - Új test type hozzáadása
  - Platform hozzárendelés
  - Szerkesztés/törlés
- Platform Types Management
  - Új platform hozzáadása
  - Szerkesztés/törlés

## 🚀 Implementációs terv

### Stage 1: Alapok átstrukturálása (2 óra)
- [ ] Test types átnevezése platform types-ra a kódban
- [ ] Új adatstruktúra létrehozása
- [ ] localStorage migráció

### Stage 2: Header Toggle implementálása (2 óra)
- [ ] Toggle switch komponens
- [ ] Test type váltás logika
- [ ] Aktív test type state management

### Stage 3: Platform konfiguráció (3 óra)
- [ ] Platform hozzárendelés test type-hoz
- [ ] Validáció score rögzítésnél
- [ ] Törlési figyelmeztetések

### Stage 4: UI frissítések (2 óra)
- [ ] Sidebar módosítások
- [ ] Tábla megjelenítés frissítése
- [ ] Modal dialógusok frissítése

### Stage 5: Tesztelés (1 óra)
- [ ] Funkcionalitás tesztelése
- [ ] Edge case-ek kezelése
- [ ] localStorage konzisztencia

## ⚠️ Fontos szempontok

### Törlési logika
- Platform eltávolítása test type-ból → figyelmeztetés score törlésről
- Test type törlése → összes kapcsolódó score törlése
- Platform type törlése → minden test type-ból eltávolítás

### Default értékek
- Video Creative Test: Meta, TikTok, YouTube
- Static Creative Test: Meta
- Add Copy Test: Meta

### Kompatibilitás
- Date range picker globális marad
- Bulk import funkció megtartása
- Export funkció adaptálása

## 🔄 Migration stratégia
1. Jelenlegi score-ok törlése (user által jóváhagyott)
2. Új struktúra inicializálása default értékekkel
3. localStorage tisztítás és újraírás

## 📝 Következő lépések
1. Experiment branch-ben dolgozunk
2. Fokozatos implementáció stage-enként
3. Minden stage után tesztelés
4. Backend integráció később

---

*Készült: 2024-01-22*
*Verzió: 1.0*