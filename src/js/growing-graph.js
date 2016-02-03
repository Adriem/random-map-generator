
/*
 * ==============================================================================
 *  Author: Adrian Moreno (admoreno@outlook.com)
 * ------------------------------------------------------------------------------
 * This algorythm generates a room on a random position and starts generating
 * the neighbours from there. Generated rooms can be:
 *
 *   +--- 0 ---+   +--- 0 ---+--- 4 ---+   +--- 0 ---+   +--- 0 ---+--- 4 ---+
 *   |         |   |                   |   |         |   |                   |
 *   3         1   3                   1   3         1   3                   1
 *   |         |   |                   |   |         |   |                   |
 *   +--- 2 ---+   +--- 2 ---+--- 6 ---+   +         +   +         +         +
 *     (1 x 1)            (2 x 1)          |         |   |                   |
 *                                         7         5   7                   5
 *                                         |         |   |                   |
 *                                         +--- 2 ---+   +--- 2 ---+--- 6 ---+
 *                                           (1 x 2)            (2 x 2)
 * ==============================================================================
 */


//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdyb3dpbmctZ3JhcGguY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSIsImZpbGUiOiJncm93aW5nLWdyYXBoLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXHJcbiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiMgIEF1dGhvcjogQWRyaWFuIE1vcmVubyAoYWRtb3Jlbm9Ab3V0bG9vay5jb20pXHJcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiMgVGhpcyBhbGdvcnl0aG0gZ2VuZXJhdGVzIGEgcm9vbSBvbiBhIHJhbmRvbSBwb3NpdGlvbiBhbmQgc3RhcnRzIGdlbmVyYXRpbmdcclxuIyB0aGUgbmVpZ2hib3VycyBmcm9tIHRoZXJlLiBHZW5lcmF0ZWQgcm9vbXMgY2FuIGJlOlxyXG4jXHJcbiMgICArLS0tIDAgLS0tKyAgICstLS0gMCAtLS0rLS0tIDQgLS0tKyAgICstLS0gMCAtLS0rICAgKy0tLSAwIC0tLSstLS0gNCAtLS0rXHJcbiMgICB8ICAgICAgICAgfCAgIHwgICAgICAgICAgICAgICAgICAgfCAgIHwgICAgICAgICB8ICAgfCAgICAgICAgICAgICAgICAgICB8XHJcbiMgICAzICAgICAgICAgMSAgIDMgICAgICAgICAgICAgICAgICAgMSAgIDMgICAgICAgICAxICAgMyAgICAgICAgICAgICAgICAgICAxXHJcbiMgICB8ICAgICAgICAgfCAgIHwgICAgICAgICAgICAgICAgICAgfCAgIHwgICAgICAgICB8ICAgfCAgICAgICAgICAgICAgICAgICB8XHJcbiMgICArLS0tIDIgLS0tKyAgICstLS0gMiAtLS0rLS0tIDYgLS0tKyAgICsgICAgICAgICArICAgKyAgICAgICAgICsgICAgICAgICArXHJcbiMgICAgICgxIHggMSkgICAgICAgICAgICAoMiB4IDEpICAgICAgICAgIHwgICAgICAgICB8ICAgfCAgICAgICAgICAgICAgICAgICB8XHJcbiMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDcgICAgICAgICA1ICAgNyAgICAgICAgICAgICAgICAgICA1XHJcbiMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgICAgICAgICB8ICAgfCAgICAgICAgICAgICAgICAgICB8XHJcbiMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICstLS0gMiAtLS0rICAgKy0tLSAyIC0tLSstLS0gNiAtLS0rXHJcbiMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKDEgeCAyKSAgICAgICAgICAgICgyIHggMilcclxuIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuIyMjXHJcbiMgZ2V0UG9zc2libGVOZWlnaGJvdXJzT0xEID0gKGRvb3IsIHJvb20sIHRpbGVtYXApIC0+XHJcbiAgIyAjIENhbGN1bGF0ZSByZWZlcmVuY2UgcG9pbnRcclxuICAjIGRvb3JGbGFncyA9IGdldERvb3JGbGFncyhkb29yKVxyXG4gICMgcmVmID1cclxuICAgICMgaWYgZG9vckZsYWdzLm5vcnRoIHRoZW4gbmV3IFBvaW50KHJvb20ucDFbMF0gKyBkb29yIC8vIDQsIHJvb20ucDFbMV0pXHJcbiAgICAjIGVsc2UgaWYgZG9vckZsYWdzLnNvdXRoIHRoZW4gbmV3IFBvaW50KHJvb20ucDFbMF0gKyBkb29yIC8vIDQsIHJvb20ucDJbMV0pXHJcbiAgICAjIGVsc2UgaWYgZG9vckZsYWdzLmVhc3QgdGhlbiBuZXcgUG9pbnQocm9vbS5wMlswXSwgcm9vbS5wMVsxXSArIGRvb3IgLy8gNClcclxuICAgICMgZWxzZSBpZiBkb29yRmxhZ3Mud2VzdCB0aGVuIG5ldyBQb2ludChyb29tLnAxWzBdLCByb29tLnAxWzFdICsgZG9vciAvLyA0KVxyXG4gICMgIyBHZW5lcmF0ZSBwb3NpYmxlIGNhbmRpZGF0ZXNcclxuICAjIGlmIGRvb3JGbGFncy5ub3J0aCB0aGVuIGNhbmRpZGF0ZXMgPSBbXHJcbiAgICAjIG5ldyBSb29tKCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgICBfX19cclxuICAgICAgIyByZWZbMF0sIHJlZlsxXSAtIDEsIDEsIDEgICAgICAgICAgICAgICAgICAgICAgICAgIyAgIHxffCAgPC0gbmVpZ2hib3VyXHJcbiAgICAgICMgcmVmWzBdLCByZWZbMV0gLSAxLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgICB8X3wgIDwtIHJlZlxyXG4gICAgICAjICgoaWYgaSBpcyAyIHRoZW4gcm9vbSBlbHNlIG51bGwpIGZvciBpIGluIFswLi4zXSkjXHJcbiAgICAjICksXHJcbiAgICAjIG5ldyBSb29tKCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgIF9fX19fXHJcbiAgICAgICMgbmV3IFBvaW50KHJlZlswXSAtIDEsIHJlZlsxXSAtIDEpLCAgICAgICAgICAgICAgICMgIHxfX198IDwtIG5laWdib3VyXHJcbiAgICAgICMgbmV3IFBvaW50KHJlZlswXSwgICAgIHJlZlsxXSAtIDEpLCAgICAgICAgICAgICAgICMgICAgfF98IDwtIHJlZlxyXG4gICAgICAjICgoaWYgaSBpcyA2IHRoZW4gcm9vbSBlbHNlIG51bGwpIGZvciBpIGluIFswLi43XSkjXHJcbiAgICAjICksXHJcbiAgICAjIG5ldyBSb29tKCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgIF9fX19fXHJcbiAgICAgICMgbmV3IFBvaW50KHJlZlswXSwgICAgIHJlZlsxXSAtIDEpLCAgICAgICAgICAgICAgICMgIHxfX198IDwtIG5laWdoYm91clxyXG4gICAgICAjIG5ldyBQb2ludChyZWZbMF0gKyAxLCByZWZbMV0gLSAxKSwgICAgICAgICAgICAgICAjICB8X3wgICA8LSByZWZcclxuICAgICAgIyAoKGlmIGkgaXMgMiB0aGVuIHJvb20gZWxzZSBudWxsKSBmb3IgaSBpbiBbMC4uN10pI1xyXG4gICAgIyApLFxyXG4gICAgIyBuZXcgUm9vbSggICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjICAgX19fXHJcbiAgICAgICMgbmV3IFBvaW50KHJlZlswXSwgcmVmWzFdIC0gMiksICAgICAgICAgICAgICAgICAgICMgICB8IHwgPC0gbmVpZ2hib3VyXHJcbiAgICAgICMgbmV3IFBvaW50KHJlZlswXSwgcmVmWzFdIC0gMSksICAgICAgICAgICAgICAgICAgICMgICB8X3xcclxuICAgICAgIyAoKGlmIGkgaXMgMiB0aGVuIHJvb20gZWxzZSBudWxsKSBmb3IgaSBpbiBbMC4uN10pIyAgIHxffCA8LSByZWZcclxuICAgICMgKSxcclxuICAgICMgbmV3IFJvb20oICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIyAgX19fX19cclxuICAgICAgIyBuZXcgUG9pbnQocmVmWzBdIC0gMSwgcmVmWzFdIC0gMiksICAgICAgICAgICAgICAgIyAgfCAgIHwgPC0gbmVpZ2hib3VyXHJcbiAgICAgICMgbmV3IFBvaW50KHJlZlswXSwgICAgIHJlZlsxXSAtIDEpLCAgICAgICAgICAgICAgICMgIHxfX198XHJcbiAgICAgICMgKChpZiBpIGlzIDYgdGhlbiByb29tIGVsc2UgbnVsbCkgZm9yIGkgaW4gWzAuLjddKSMgICAgfF98IDwtIHJlZlxyXG4gICAgIyApLFxyXG4gICAgIyBuZXcgUm9vbSggICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjICBfX19fX1xyXG4gICAgICAjIG5ldyBQb2ludChyZWZbMF0sICAgICByZWZbMV0gLSAyKSwgICAgICAgICAgICAgICAjICB8ICAgfCA8LW5laWdoYm91clxyXG4gICAgICAjIG5ldyBQb2ludChyZWZbMF0gKyAxLCByZWZbMV0gLSAxKSwgICAgICAgICAgICAgICAjICB8X19ffFxyXG4gICAgICAjICgoaWYgaSBpcyAyIHRoZW4gcm9vbSBlbHNlIG51bGwpIGZvciBpIGluIFswLi43XSkjICB8X3wgICA8LSByZWZcclxuICAgICMgKVxyXG4gICMgXVxyXG4gICMgZWxzZSBpZiBkb29yRmxhZ3Muc291dGggdGhlbiBjYW5kaWRhdGVzID0gW1xyXG4gICAgIyBuZXcgUm9vbSggICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjICAgX19fXHJcbiAgICAgICMgbmV3IFBvaW50KHJlZlswXSwgcmVmWzFdICsgMSksICAgICAgICAgICAgICAgICAgICMgICB8X3wgIDwtIHJlZlxyXG4gICAgICAjIG5ldyBQb2ludChyZWZbMF0sIHJlZlsxXSArIDEpLCAgICAgICAgICAgICAgICAgICAjICAgfF98ICA8LSBuZWlnaGJvdXJcclxuICAgICAgIyAoKGlmIGkgaXMgMCB0aGVuIHJvb20gZWxzZSBudWxsKSBmb3IgaSBpbiBbMC4uN10pI1xyXG4gICAgIyApLFxyXG4gICAgIyBuZXcgUm9vbSggICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjICAgIF9fX1xyXG4gICAgICAjIG5ldyBQb2ludChyZWZbMF0gLSAxLCByZWZbMV0gKyAxKSwgICAgICAgICAgICAgICAjICBfX3xffCAgPC0gcmVmXHJcbiAgICAgICMgbmV3IFBvaW50KHJlZlswXSwgICAgIHJlZlsxXSArIDEpLCAgICAgICAgICAgICAgICMgIHxfX198ICA8LSBuZWlnaGJvdXJcclxuICAgICAgIyAoKGlmIGkgaXMgNCB0aGVuIHJvb20gZWxzZSBudWxsKSBmb3IgaSBpbiBbMC4uN10pI1xyXG4gICAgIyApLFxyXG4gICAgIyBuZXcgUm9vbSggICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjICBfX19cclxuICAgICAgIyBuZXcgUG9pbnQocmVmWzBdLCAgICAgcmVmWzFdICsgMSksICAgICAgICAgICAgICAgIyAgfF98X18gIDwtIHJlZlxyXG4gICAgICAjIG5ldyBQb2ludChyZWZbMF0gKyAxLCByZWZbMV0gKyAxKSwgICAgICAgICAgICAgICAjICB8X19ffCAgPC0gbmVpZ2hib3VyXHJcbiAgICAgICMgKChpZiBpIGlzIDAgdGhlbiByb29tIGVsc2UgbnVsbCkgZm9yIGkgaW4gWzAuLjddKSNcclxuICAgICMgKSxcclxuICAgICMgbmV3IFJvb20oICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIyAgIF9fX1xyXG4gICAgICAjIG5ldyBQb2ludChyZWZbMF0sICAgICByZWZbMV0gKyAxKSwgICAgICAgICAgICAgICAjICAgfF98ICA8LSByZWZcclxuICAgICAgIyBuZXcgUG9pbnQocmVmWzBdLCAgICAgcmVmWzFdICsgMiksICAgICAgICAgICAgICAgIyAgIHwgfFxyXG4gICAgICAjICgoaWYgaSBpcyAwIHRoZW4gcm9vbSBlbHNlIG51bGwpIGZvciBpIGluIFswLi43XSkjICAgfF98ICA8LSBuZWlnaGJvdXJcclxuICAgICMgKSxcclxuICAgICMgbmV3IFJvb20oICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIyAgICBfX19cclxuICAgICAgIyBuZXcgUG9pbnQocmVmWzBdIC0gMSwgcmVmWzFdICsgMSksICAgICAgICAgICAgICAgIyAgX198X3wgIDwtIHJlZlxyXG4gICAgICAjIG5ldyBQb2ludChyZWZbMF0sICAgICByZWZbMV0gKyAyKSwgICAgICAgICAgICAgICAjICB8ICAgfFxyXG4gICAgICAjICgoaWYgaSBpcyA0IHRoZW4gcm9vbSBlbHNlIG51bGwpIGZvciBpIGluIFswLi43XSkjICB8X19ffCAgPC0gbmVpZ2hib3VyXHJcbiAgICAjICksXHJcbiAgICAjIG5ldyBSb29tKCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgIF9fX1xyXG4gICAgICAjIG5ldyBQb2ludChyZWZbMF0sICAgICByZWZbMV0gKyAxKSwgICAgICAgICAgICAgICAjICB8X3xfXyAgPC0gcmVmXHJcbiAgICAgICMgbmV3IFBvaW50KHJlZlswXSArIDEsIHJlZlsxXSArIDIpLCAgICAgICAgICAgICAgICMgIHwgICB8XHJcbiAgICAgICMgKChpZiBpIGlzIDAgdGhlbiByb29tIGVsc2UgbnVsbCkgZm9yIGkgaW4gWzAuLjddKSMgIHxfX198ICA8LSBuZWlnaGJvdXJcclxuICAgICMgKVxyXG4gICMgXVxyXG4gICMgZWxzZSBpZiBkb29yRmxhZ3MuZWFzdCB0aGVuIGNhbmRpZGF0ZXMgPSBbXHJcbiAgICAjIG5ldyBSb29tKCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICNcclxuICAgICAgIyBuZXcgUG9pbnQocmVmWzBdICsgMSwgcmVmWzFdICAgICksICAgICAgICAgICAgICAgIyAgICAgICAgX19fX19cclxuICAgICAgIyBuZXcgUG9pbnQocmVmWzBdICsgMSwgcmVmWzFdICAgICksICAgICAgICAgICAgICAgIyByZWYgLT4gfF98X3wgPC0gbmVpZ2hcclxuICAgICAgIyAoKGlmIGkgaXMgMyB0aGVuIHJvb20gZWxzZSBudWxsKSBmb3IgaSBpbiBbMC4uN10pI1xyXG4gICAgIyApLFxyXG4gICAgIyBuZXcgUm9vbSggICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjICAgICAgICAgIF9fX1xyXG4gICAgICAjIG5ldyBQb2ludChyZWZbMF0gKyAxLCByZWZbMV0gLSAxKSwgICAgICAgICAgICAgICAjICAgICAgICBfX3wgfFxyXG4gICAgICAjIG5ldyBQb2ludChyZWZbMF0gKyAxLCByZWZbMV0gICAgKSwgICAgICAgICAgICAgICAjIHJlZiAtPiB8X3xffCA8LSBuZWlnaFxyXG4gICAgICAjICgoaWYgaSBpcyA3IHRoZW4gcm9vbSBlbHNlIG51bGwpIGZvciBpIGluIFswLi43XSkjXHJcbiAgICAjICksXHJcbiAgICAjIG5ldyBSb29tKCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICNcclxuICAgICAgIyBuZXcgUG9pbnQocmVmWzBdICsgMSwgcmVmWzFdICAgICksICAgICAgICAgICAgICAgIyAgICAgICAgX19fX19cclxuICAgICAgIyBuZXcgUG9pbnQocmVmWzBdICsgMSwgcmVmWzFdICsgMSksICAgICAgICAgICAgICAgIyByZWYgLT4gfF98IHwgPC0gbmVpZ2hcclxuICAgICAgIyAoKGlmIGkgaXMgMyB0aGVuIHJvb20gZWxzZSBudWxsKSBmb3IgaSBpbiBbMC4uN10pIyAgICAgICAgICB8X3xcclxuICAgICMgKSxcclxuICAgICMgbmV3IFJvb20oICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgI1xyXG4gICAgICAjIG5ldyBQb2ludChyZWZbMF0gKyAxLCByZWZbMV0gICAgKSwgICAgICAgICAgICAgICAjICAgICAgICBfX19fX19fXHJcbiAgICAgICMgbmV3IFBvaW50KHJlZlswXSArIDIsIHJlZlsxXSAgICApLCAgICAgICAgICAgICAgICMgcmVmIC0+IHxffF9fX3wgPC0gbmVpZ2hcclxuICAgICAgIyAoKGlmIGkgaXMgMyB0aGVuIHJvb20gZWxzZSBudWxsKSBmb3IgaSBpbiBbMC4uN10pI1xyXG4gICAgIyApLFxyXG4gICAgIyBuZXcgUm9vbSggICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjICAgICAgICAgIF9fX19fXHJcbiAgICAgICMgbmV3IFBvaW50KHJlZlswXSArIDEsIHJlZlsxXSAtIDEpLCAgICAgICAgICAgICAgICMgICAgICAgIF9ffCAgIHxcclxuICAgICAgIyBuZXcgUG9pbnQocmVmWzBdICsgMiwgcmVmWzFdICAgICksICAgICAgICAgICAgICAgIyByZWYgLT4gfF98X19ffCA8LSBuZWlnaFxyXG4gICAgICAjICgoaWYgaSBpcyA3IHRoZW4gcm9vbSBlbHNlIG51bGwpIGZvciBpIGluIFswLi43XSkjXHJcbiAgICAjICksXHJcbiAgICAjIG5ldyBSb29tKCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICNcclxuICAgICAgIyBuZXcgUG9pbnQocmVmWzBdICsgMSwgcmVmWzFdICAgICksICAgICAgICAgICAgICAgIyAgICAgICAgX19fX19fX1xyXG4gICAgICAjIG5ldyBQb2ludChyZWZbMF0gKyAyLCByZWZbMV0gKyAxKSwgICAgICAgICAgICAgICAjIHJlZiAtPiB8X3wgICB8IDwtIG5laWdoXHJcbiAgICAgICMgKChpZiBpIGlzIDMgdGhlbiByb29tIGVsc2UgbnVsbCkgZm9yIGkgaW4gWzAuLjddKSMgICAgICAgICAgfF9fX3xcclxuICAgICMgKVxyXG4gICMgXVxyXG4gICMgZWxzZSBpZiBkb29yRmxhZ3Mud2VzdCB0aGVuIGNhbmRpZGF0ZXMgPSBbXHJcbiAgICAjIG5ldyBSb29tKCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICNcclxuICAgICAgIyBuZXcgUG9pbnQocmVmWzBdIC0gMSwgcmVmWzFdKSwgICAgICAgICAgICAgICAgICAgIyAgICAgICAgICBfX19fX1xyXG4gICAgICAjIG5ldyBQb2ludChyZWZbMF0gLSAxLCByZWZbMV0pLCAgICAgICAgICAgICAgICAgICAjIG5laWdoIC0+IHxffF98IDwtIHJlZlxyXG4gICAgICAjICgoaWYgaSBpcyAxIHRoZW4gcm9vbSBlbHNlIG51bGwpIGZvciBpIGluIFswLi43XSkjXHJcbiAgICAjICksXHJcbiAgICAjIG5ldyBSb29tKCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgICAgICAgICAgX19fXHJcbiAgICAgICMgbmV3IFBvaW50KHJlZlswXSAtIDEsIHJlZlsxXSAtIDEpLCAgICAgICAgICAgICAgICMgICAgICAgICAgfCB8X19cclxuICAgICAgIyBuZXcgUG9pbnQocmVmWzBdIC0gMSwgcmVmWzFdKSwgICAgICAgICAgICAgICAgICAgIyBuZWlnaCAtPiB8X3xffCA8LSByZWZcclxuICAgICAgIyAoKGlmIGkgaXMgNSB0aGVuIHJvb20gZWxzZSBudWxsKSBmb3IgaSBpbiBbMC4uN10pI1xyXG4gICAgIyApLFxyXG4gICAgIyBuZXcgUm9vbSggICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjXHJcbiAgICAgICMgbmV3IFBvaW50KHJlZlswXSAtIDEsIHJlZlsxXSksICAgICAgICAgICAgICAgICAgICMgICAgICAgICAgX19fX19cclxuICAgICAgIyBuZXcgUG9pbnQocmVmWzBdIC0gMSwgcmVmWzFdICsgMSksICAgICAgICAgICAgICAgIyBuZWlnaCAtPiB8IHxffCA8LSByZWZcclxuICAgICAgIyAoKGlmIGkgaXMgMSB0aGVuIHJvb20gZWxzZSBudWxsKSBmb3IgaSBpbiBbMC4uN10pIyAgICAgICAgICB8X3xcclxuICAgICMgKSxcclxuICAgICMgbmV3IFJvb20oICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgI1xyXG4gICAgICAjIG5ldyBQb2ludChyZWZbMF0gLSAyLCByZWZbMV0pLCAgICAgICAgICAgICAgICAgICAjICAgICAgICAgIF9fX19fX19cclxuICAgICAgIyBuZXcgUG9pbnQocmVmWzBdIC0gMSwgcmVmWzFdKSwgICAgICAgICAgICAgICAgICAgIyBuZWlnaCAtPiB8X19ffF98IDwtIHJlZlxyXG4gICAgICAjICgoaWYgaSBpcyAxIHRoZW4gcm9vbSBlbHNlIG51bGwpIGZvciBpIGluIFswLi43XSkjXHJcbiAgICAjICksXHJcbiAgICAjIG5ldyBSb29tKCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgICAgICAgICAgX19fX19cclxuICAgICAgIyBuZXcgUG9pbnQocmVmWzBdIC0gMiwgcmVmWzFdIC0gMSksICAgICAgICAgICAgICAgIyAgICAgICAgICB8ICAgfF9fXHJcbiAgICAgICMgbmV3IFBvaW50KHJlZlswXSAtIDEsIHJlZlsxXSksICAgICAgICAgICAgICAgICAgICMgbmVpZ2ggLT4gfF9fX3xffCA8LSByZWZcclxuICAgICAgIyAoKGlmIGkgaXMgNSB0aGVuIHJvb20gZWxzZSBudWxsKSBmb3IgaSBpbiBbMC4uN10pI1xyXG4gICAgIyApLFxyXG4gICAgIyBuZXcgUm9vbSggICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjXHJcbiAgICAgICMgbmV3IFBvaW50KHJlZlswXSAtIDIsIHJlZlsxXSksICAgICAgICAgICAgICAgICAgICMgICAgICAgICAgX19fX19fX1xyXG4gICAgICAjIG5ldyBQb2ludChyZWZbMF0gLSAxLCByZWZbMV0gKyAxKSwgICAgICAgICAgICAgICAjIG5laWdoIC0+IHwgICB8X3wgPC0gcmVmXHJcbiAgICAgICMgKChpZiBpIGlzIDEgdGhlbiByb29tIGVsc2UgbnVsbCkgZm9yIGkgaW4gWzAuLjddKSMgICAgICAgICAgfF9fX3xcclxuICAgICMgKVxyXG4gICMgXVxyXG4gICMgIyBSZXR1cm4gdGhlIG9uZXMgdGhhdCBkb24ndCBjb2xsaWRlXHJcbiAgIyBmb3IgYyBpbiBjYW5kaWRhdGVzXHJcbiAgICAjIGNvbnNvbGUubG9nIGNcclxuICAgICMgYyBpZiB0aWxlbWFwLmlzKGMub3JpZ2luWzBdLCBjLm9yaWdpblsxXSwgYy53aWR0aCwgYy5oZWlnaHQsIFRpbGUuRU1QVFkpXHJcbiAgIyAjIGNvbnNvbGUubG9nIGNcclxuICAjICMgcmV0dXJuIGMgZm9yIGMgaW4gY2FuZGlkYXRlcyB3aGVuIHRpbGVtYXAuaXMoYy5vcmlnaW5bMF0sIGMub3JpZ2luWzFdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgIyBjLndpZHRoLCBjLmhlaWdodCwgVGlsZS5FTVBUWSlcclxuIl19