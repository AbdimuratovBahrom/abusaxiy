// Фото электрощитов (ШР, ШО, ВРУ, ЯРВ) — ТЦ «Абусахий»
// Источник: C:\Users\user\Desktop\ШР,ШО, скопировано и переименовано по смыслу в img/shields/.
// block: "1" | "2" | "3" | "common" (не привязано к конкретному блоку)
// row: буква ряда ("A".."R"), цифра для 3-блока, или "X" если ряд не определён
// type: "SHO" (ШО) | "SHR" (ШР) | "VRU" (ВРУ) | "PANEL" (общий/смешанный щит)
window.SHIELDS_DATA = [
  { block: "1", row: "D", type: "SHO",   label: "D62",                                   file: "1_D_SHO_D62.jpg" },
  { block: "1", row: "A", type: "SHO",   label: "A24",                                   file: "1_A_SHO_A24.jpg" },
  { block: "1", row: "A", type: "SHO",   label: "A8",                                    file: "1_A_SHO_A8.jpg" },
  { block: "1", row: "Q", type: "SHR",   label: "Q катор",                               file: "1_Q_SHR_Q катор.jpg" },
  { block: "1", row: "R", type: "PANEL", label: "R1, R3",                                file: "1_R_PANEL_R1, R3.jpg" },
  { block: "1", row: "X", type: "VRU",   label: "ШР, ЯРВ 2(F), ЯРВ 4(B)",                 file: "1_X_VRU_ШР, ЯРВ 2(F), ЯРВ 4(B).jpg" },
  { block: "1", row: "C", type: "SHO",   label: "C21",                                   file: "1_C_SHO_C21.jpg" },
  { block: "1", row: "L", type: "SHO",   label: "35, туалет орқасида",                    file: "1_L_SHO_35, туалет орқасида.jpg" },
  { block: "1", row: "R", type: "SHO",   label: "R1",                                    file: "1_R_SHO_R1.jpg" },
  { block: "1", row: "D", type: "SHR",   label: "D-E катор, A1, A2 катор",                file: "1_D_SHR_D-E катор, A1, A2 катор.jpg" },
  { block: "1", row: "B", type: "SHR",   label: "B-C, D-C катор",                         file: "1_B_SHR_B-C, D-C катор.jpg" },
  { block: "1", row: "E", type: "SHR",   label: "E-F катор",                              file: "1_E_SHR_E-F катор.jpg" },

  { block: "2", row: "J", type: "SHO",   label: "2",                                     file: "2_J_SHO_2.jpg" },
  { block: "2", row: "X", type: "PANEL", label: "щит 2",                                 file: "2_X_PANEL_щит 2.jpg" },
  { block: "2", row: "X", type: "PANEL", label: "щит 3",                                 file: "2_X_PANEL_щит 3.jpg" },
  { block: "2", row: "X", type: "PANEL", label: "щит 4",                                 file: "2_X_PANEL_щит 4.jpg" },
  { block: "2", row: "X", type: "PANEL", label: "щит 5",                                 file: "2_X_PANEL_щит 5.jpg" },
  { block: "2", row: "X", type: "PANEL", label: "щит 6",                                 file: "2_X_PANEL_щит 6.jpg" },
  { block: "2", row: "X", type: "PANEL", label: "щит 7",                                 file: "2_X_PANEL_щит 7.jpg" },
  { block: "2", row: "J", type: "SHO",   label: "J2",                                    file: "2_J_SHO_J2.jpg" },
  { block: "2", row: "R", type: "SHO",   label: "R5(1), R5(2)",                           file: "2_R_SHO_R5(1), R5(2).jpg" },

  { block: "3", row: "X", type: "SHO",   label: "16",                                    file: "3_X_SHO_16.jpg" },
  { block: "3", row: "4", type: "SHO",   label: "11",                                    file: "3_4_SHO_11.jpg" },
  { block: "3", row: "X", type: "SHO",   label: "магазин 5a1",                           file: "3_X_SHO_магазин 5a1.jpg" },
  { block: "3", row: "X", type: "SHO",   label: "10",                                    file: "3_X_SHO_10.jpg" },
  { block: "3", row: "X", type: "SHO",   label: "13",                                    file: "3_X_SHO_13.jpg" },
  { block: "3", row: "X", type: "SHO",   label: "3",                                     file: "3_X_SHO_3.jpg" },
  { block: "3", row: "X", type: "SHO",   label: "4",                                     file: "3_X_SHO_4.jpg" },

  { block: "common", row: "X", type: "SHO", label: "Гипермаркет, Urgut ошхонаси 2",       file: "common_X_SHO_Гипермаркет, Urgut ошхонаси 2.jpg" },
  { block: "common", row: "X", type: "SHO", label: "Гипермаркет, Urgut ошхонаси",         file: "common_X_SHO_Гипермаркет, Urgut ошхонаси.jpg" },
  { block: "common", row: "X", type: "SHO", label: "Файз подвал",                         file: "common_X_SHO_Файз подвал.jpg" },
];
