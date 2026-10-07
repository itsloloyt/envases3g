---
description: Genera un reel vertical sobre una herramienta de IA (gasta ~75 créditos de Higgsfield)
argument-hint: [tema o herramienta]
---
El usuario quiere un reel sobre: $ARGUMENTS (si está vacío, una herramienta nueva de esta semana).

Sigue las instrucciones de CLAUDE.md: lanza en segundo plano `python3 reel.py --tema "$ARGUMENTS"` (o `python3 reel.py` sin tema; en Windows usa `python` o `py`), dime qué herramienta has elegido en cuanto aparezca en el log y, al terminar, dame la ruta del reel, el caption y las fuentes. Este comando ya autoriza el gasto de créditos. Si solo falla la edición, reintenta con `editar.py` sin gastar créditos.
