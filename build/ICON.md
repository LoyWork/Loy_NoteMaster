# Loy NoteMaster icon

The master artwork is `icon-source.png`: a midnight-blue leather notebook, ivory paper label and brass pencil, in an early-iOS skeuomorphic style. Exterior pixels are transparent.

Regenerate all raster sizes and native icon containers on Windows:

```powershell
powershell -NoProfile -File scripts/generate-icons.ps1
```

The script updates the Windows installer/executable ICO, PNG app/about icons, favicon, Windows tray sizes, AppX logos and ICNS asset. The macOS menu-bar template assets remain monochrome system templates.

Windows builds use `electron-builder.fork.json` and `build/icon.ico`. Unpackaged Windows and Linux windows use `src/main/assets/icon.png`.
