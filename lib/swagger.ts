export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'ClanBoard API',
    version: '1.0.0',
    description:
      'API REST de ClanBoard — gestión de hogar compartido con tareas, sistema de XP y lista de compras.',
  },
  servers: [{ url: '/api', description: 'Servidor de la aplicación' }],
  tags: [
    { name: 'auth', description: 'Autenticación y registro de usuarios' },
    { name: 'tareas', description: 'Gestión de tareas del hogar' },
    { name: 'perfil', description: 'Perfil del usuario' },
    { name: 'hogar', description: 'Configuración y administración del hogar' },
    { name: 'lista-compras', description: 'Lista de compras compartida del hogar' },
    { name: 'setup', description: 'Configuración inicial para usuarios de Google OAuth' },
  ],
  components: {
    securitySchemes: {
      sessionCookie: {
        type: 'apiKey',
        in: 'cookie',
        name: 'authjs.session-token',
        description:
          'Cookie de sesión JWT establecida automáticamente por Auth.js al iniciar sesión con email/contraseña o Google OAuth.',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        required: ['error'],
        properties: {
          error: { type: 'string', example: 'Mensaje de error descriptivo' },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '507f1f77bcf86cd799439011' },
          email: { type: 'string', format: 'email', example: 'usuario@ejemplo.com' },
        },
      },
      Perfil: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '507f1f77bcf86cd799439012' },
          userId: { type: 'string', example: '507f1f77bcf86cd799439011' },
          hogarId: { type: 'string', example: '507f1f77bcf86cd799439013' },
          nombre: { type: 'string', example: 'Adrián' },
          rol: { type: 'string', enum: ['admin', 'miembro'], example: 'admin' },
          avatar: { type: 'string', nullable: true, example: '🏠' },
          xp: { type: 'integer', example: 150 },
          xpMensual: { type: 'integer', example: 75 },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Hogar: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '507f1f77bcf86cd799439013' },
          nombre: { type: 'string', example: 'Casa Familia García' },
          codigoInvitacion: { type: 'string', example: 'A1B2C3D4' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Tarea: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '507f1f77bcf86cd799439014' },
          hogarId: { type: 'string', example: '507f1f77bcf86cd799439013' },
          titulo: { type: 'string', example: 'Limpiar la cocina' },
          descripcion: { type: 'string', nullable: true, example: 'Incluir estufa y mesada' },
          asignadoA: {
            type: 'string',
            nullable: true,
            description: 'ID del Perfil asignado',
            example: '507f1f77bcf86cd799439012',
          },
          completada: { type: 'boolean', example: false },
          xpValor: {
            type: 'integer',
            description: 'XP que otorga al completar: básica=10, intermedia=20, épica=40',
            example: 20,
          },
          color: {
            type: 'string',
            nullable: true,
            enum: ['yellow', 'blue', 'green', 'pink', 'purple', 'orange'],
            example: 'yellow',
          },
          fechaLimite: { type: 'string', nullable: true, format: 'date-time' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      ItemListaCompras: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '507f1f77bcf86cd799439015' },
          hogarId: { type: 'string', example: '507f1f77bcf86cd799439013' },
          nombre: { type: 'string', example: 'Leche' },
          agregadoPor: {
            type: 'string',
            description: 'ID del Perfil que agregó el ítem',
            example: '507f1f77bcf86cd799439012',
          },
          comprado: { type: 'boolean', example: false },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      DashboardResponse: {
        type: 'object',
        properties: {
          perfil: { $ref: '#/components/schemas/Perfil' },
          hogar: { $ref: '#/components/schemas/Hogar' },
          perfiles: {
            type: 'array',
            description: 'Todos los perfiles del hogar, ordenados por XP descendente',
            items: { $ref: '#/components/schemas/Perfil' },
          },
          tareas: {
            type: 'array',
            description: 'Todas las tareas del hogar, ordenadas por fecha de creación descendente',
            items: { $ref: '#/components/schemas/Tarea' },
          },
        },
      },
    },
  },
  paths: {
    '/auth/login': {
      post: {
        tags: ['auth'],
        summary: 'Iniciar sesión con email y contraseña',
        description:
          'Valida credenciales contra la base de datos. La sesión se gestiona via Auth.js (cookie JWT). Las cuentas creadas con Google no tienen contraseña y deben usar `signIn("google")`.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'usuario@ejemplo.com' },
                  password: { type: 'string', minLength: 6, example: 'mi_contraseña' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Login exitoso — devuelve el usuario',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { user: { $ref: '#/components/schemas/User' } },
                },
              },
            },
          },
          '400': {
            description: 'Email o contraseña no enviados',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
          '401': {
            description: 'Credenciales incorrectas o cuenta vinculada a Google',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
          '500': {
            description: 'Error interno del servidor',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },

    '/auth/register': {
      post: {
        tags: ['auth'],
        summary: 'Registrarse y crear o unirse a un hogar',
        description:
          'Crea un usuario con email/contraseña y según el `mode`:\n- **crear**: genera un hogar nuevo con el usuario como administrador.\n- **unirse**: agrega al usuario a un hogar existente usando el código de invitación.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                oneOf: [
                  {
                    title: 'Crear hogar',
                    type: 'object',
                    required: ['email', 'password', 'nombrePerfil', 'mode', 'nombreHogar'],
                    properties: {
                      email: { type: 'string', format: 'email', example: 'usuario@ejemplo.com' },
                      password: { type: 'string', minLength: 6, example: 'mi_contraseña' },
                      nombrePerfil: { type: 'string', example: 'Adrián' },
                      mode: { type: 'string', enum: ['crear'], example: 'crear' },
                      nombreHogar: { type: 'string', example: 'Casa Familia García' },
                    },
                  },
                  {
                    title: 'Unirse a hogar existente',
                    type: 'object',
                    required: ['email', 'password', 'nombrePerfil', 'mode', 'codigoInvitacion'],
                    properties: {
                      email: { type: 'string', format: 'email', example: 'otro@ejemplo.com' },
                      password: { type: 'string', minLength: 6, example: 'otra_contraseña' },
                      nombrePerfil: { type: 'string', example: 'María' },
                      mode: { type: 'string', enum: ['unirse'], example: 'unirse' },
                      codigoInvitacion: { type: 'string', example: 'A1B2C3D4' },
                    },
                  },
                ],
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Registro exitoso — devuelve el usuario creado',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { user: { $ref: '#/components/schemas/User' } },
                },
              },
            },
          },
          '400': {
            description: 'Campos faltantes, contraseña muy corta o modo inválido',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
          '404': {
            description: 'Código de invitación no válido (modo unirse)',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
          '409': {
            description: 'Ya existe una cuenta con ese email',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
          '500': {
            description: 'Error interno del servidor',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },

    '/auth/logout': {
      post: {
        tags: ['auth'],
        summary: 'Cerrar sesión (elimina cookie legacy)',
        description:
          'Elimina la cookie `auth-token` del sistema de autenticación legacy. Para sesiones Auth.js, usar `signOut()` en el cliente.',
        security: [{ sessionCookie: [] }],
        responses: {
          '200': {
            description: 'Logout exitoso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { ok: { type: 'boolean', example: true } },
                },
              },
            },
          },
        },
      },
    },

    '/auth/me': {
      get: {
        tags: ['auth'],
        summary: 'Obtener el usuario autenticado actual',
        description:
          'Devuelve el usuario de la sesión activa. Compatible con cookie legacy y sesiones Auth.js JWT.',
        security: [{ sessionCookie: [] }],
        responses: {
          '200': {
            description: 'Usuario autenticado',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { user: { $ref: '#/components/schemas/User' } },
                },
              },
            },
          },
          '401': {
            description: 'No autenticado — devuelve `user: null`',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { user: { type: 'object', nullable: true, example: null } },
                },
              },
            },
          },
        },
      },
    },

    '/dashboard': {
      get: {
        tags: ['hogar'],
        summary: 'Obtener datos completos del dashboard',
        description:
          'Devuelve en una sola petición el perfil del usuario, el hogar, todos los perfiles del hogar (ordenados por XP desc) y las tareas (ordenadas por fecha desc). Requiere sesión activa.',
        security: [{ sessionCookie: [] }],
        responses: {
          '200': {
            description: 'Datos del dashboard',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/DashboardResponse' },
              },
            },
          },
          '401': {
            description: 'No autenticado',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
          '404': {
            description: 'Perfil u hogar no encontrado para el usuario',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },

    '/tareas': {
      post: {
        tags: ['tareas'],
        summary: 'Crear una nueva tarea',
        description: 'Crea una tarea en el hogar del usuario autenticado.',
        security: [{ sessionCookie: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['titulo', 'xpValor'],
                properties: {
                  titulo: { type: 'string', example: 'Limpiar la cocina' },
                  descripcion: { type: 'string', nullable: true, example: 'Incluir estufa y mesada' },
                  asignadoA: {
                    type: 'string',
                    nullable: true,
                    description: 'ID del Perfil asignado (no del User)',
                    example: '507f1f77bcf86cd799439012',
                  },
                  xpValor: {
                    type: 'integer',
                    description: 'básica=10, intermedia=20, épica=40',
                    example: 20,
                  },
                  color: {
                    type: 'string',
                    nullable: true,
                    enum: ['yellow', 'blue', 'green', 'pink', 'purple', 'orange'],
                    example: 'yellow',
                  },
                  fechaLimite: { type: 'string', nullable: true, format: 'date-time' },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Tarea creada exitosamente',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Tarea' } } },
          },
          '401': {
            description: 'No autenticado',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
          '404': {
            description: 'Perfil no encontrado',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },

    '/tareas/{id}': {
      patch: {
        tags: ['tareas'],
        summary: 'Editar una tarea existente',
        security: [{ sessionCookie: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'ID de la tarea',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  titulo: { type: 'string', example: 'Limpiar el baño' },
                  descripcion: { type: 'string', nullable: true, example: null },
                  asignadoA: { type: 'string', nullable: true, example: '507f1f77bcf86cd799439012' },
                  xpValor: { type: 'integer', example: 10 },
                  color: { type: 'string', nullable: true, example: 'blue' },
                  fechaLimite: { type: 'string', nullable: true, format: 'date-time' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Tarea actualizada',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Tarea' } } },
          },
          '401': {
            description: 'No autenticado',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
      delete: {
        tags: ['tareas'],
        summary: 'Eliminar una tarea',
        security: [{ sessionCookie: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'ID de la tarea',
          },
        ],
        responses: {
          '204': { description: 'Tarea eliminada' },
          '401': {
            description: 'No autenticado',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },

    '/tareas/{id}/completar': {
      post: {
        tags: ['tareas'],
        summary: 'Marcar una tarea como completada',
        description:
          'Marca `completada: true` en la tarea y suma `xpValor` al `xp` y `xpMensual` del perfil asignado (si existe).',
        security: [{ sessionCookie: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'ID de la tarea',
          },
        ],
        responses: {
          '200': {
            description: 'Tarea marcada como completada',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Tarea' } } },
          },
          '401': {
            description: 'No autenticado',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },

    '/perfil': {
      patch: {
        tags: ['perfil'],
        summary: 'Actualizar nombre y avatar del perfil',
        description: 'Actualiza el nombre visible y el emoji/avatar del perfil del usuario autenticado.',
        security: [{ sessionCookie: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  nombre: { type: 'string', example: 'Adrián' },
                  avatar: { type: 'string', description: 'Emoji o string de avatar', example: '🏡' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Perfil actualizado',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Perfil' } } },
          },
          '401': {
            description: 'No autenticado',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
          '500': {
            description: 'Error al actualizar (perfil no encontrado en DB)',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },

    '/hogares/{id}': {
      patch: {
        tags: ['hogar'],
        summary: 'Actualizar el nombre del hogar',
        security: [{ sessionCookie: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'ID del hogar',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nombre'],
                properties: {
                  nombre: { type: 'string', example: 'Departamento Centro' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Hogar actualizado',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Hogar' } } },
          },
          '401': {
            description: 'No autenticado',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },

    '/hogares/{id}/regenerar-codigo': {
      post: {
        tags: ['hogar'],
        summary: 'Regenerar el código de invitación del hogar',
        description:
          'Genera un nuevo código aleatorio de 8 caracteres (hex en mayúsculas) e invalida el anterior. Útil cuando el código fue compartido accidentalmente.',
        security: [{ sessionCookie: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'ID del hogar',
          },
        ],
        responses: {
          '200': {
            description: 'Nuevo código generado',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    codigo: { type: 'string', example: 'F4A9B2C1' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'No autenticado',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },

    '/lista-compras': {
      get: {
        tags: ['lista-compras'],
        summary: 'Obtener la lista de compras del hogar',
        description:
          'Devuelve todos los ítems de la lista de compras del hogar del usuario, ordenados por fecha de creación ascendente.',
        security: [{ sessionCookie: [] }],
        responses: {
          '200': {
            description: 'Lista de compras',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/ItemListaCompras' },
                },
              },
            },
          },
          '401': {
            description: 'No autenticado',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
          '404': {
            description: 'Perfil no encontrado',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
      post: {
        tags: ['lista-compras'],
        summary: 'Agregar un ítem a la lista de compras',
        security: [{ sessionCookie: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nombre'],
                properties: {
                  nombre: { type: 'string', example: 'Leche' },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Ítem agregado',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ItemListaCompras' } },
            },
          },
          '401': {
            description: 'No autenticado',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
          '404': {
            description: 'Perfil no encontrado',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },

    '/lista-compras/{id}': {
      patch: {
        tags: ['lista-compras'],
        summary: 'Marcar o desmarcar un ítem como comprado',
        security: [{ sessionCookie: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'ID del ítem',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['comprado'],
                properties: {
                  comprado: { type: 'boolean', example: true },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Ítem actualizado',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ItemListaCompras' } },
            },
          },
          '401': {
            description: 'No autenticado',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
      delete: {
        tags: ['lista-compras'],
        summary: 'Eliminar un ítem de la lista',
        security: [{ sessionCookie: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'ID del ítem',
          },
        ],
        responses: {
          '204': { description: 'Ítem eliminado' },
          '401': {
            description: 'No autenticado',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },

    '/lista-compras/clear': {
      delete: {
        tags: ['lista-compras'],
        summary: 'Eliminar todos los ítems ya comprados',
        description:
          'Elimina en batch todos los ítems con `comprado: true` del hogar del usuario. Los ítems pendientes no se ven afectados.',
        security: [{ sessionCookie: [] }],
        responses: {
          '204': { description: 'Ítems comprados eliminados' },
          '401': {
            description: 'No autenticado',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
          '404': {
            description: 'Perfil no encontrado',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },

    '/setup/crear-hogar': {
      post: {
        tags: ['setup'],
        summary: 'Crear hogar para usuario de Google OAuth (primer login)',
        description:
          'Usado después del primer login con Google, cuando el usuario aún no tiene hogar. Crea el hogar y el perfil con rol `admin`. Requiere sesión Auth.js activa.',
        security: [{ sessionCookie: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nombreHogar', 'nombrePerfil'],
                properties: {
                  nombreHogar: { type: 'string', example: 'Casa Familia García' },
                  nombrePerfil: { type: 'string', example: 'Adrián' },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Hogar creado exitosamente',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Hogar' } } },
          },
          '400': {
            description: 'Campos `nombreHogar` o `nombrePerfil` faltantes',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
          '401': {
            description: 'No autenticado con Auth.js',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },

    '/setup/unirse': {
      post: {
        tags: ['setup'],
        summary: 'Unirse a un hogar para usuario de Google OAuth (primer login)',
        description:
          'Usado después del primer login con Google, cuando el usuario aún no tiene hogar. Crea el perfil con rol `miembro` en el hogar correspondiente al código de invitación.',
        security: [{ sessionCookie: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nombrePerfil', 'codigoInvitacion'],
                properties: {
                  nombrePerfil: { type: 'string', example: 'María' },
                  codigoInvitacion: { type: 'string', example: 'A1B2C3D4' },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Perfil creado en el hogar',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Perfil' } } },
          },
          '400': {
            description: 'Campos `nombrePerfil` o `codigoInvitacion` faltantes',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
          '401': {
            description: 'No autenticado con Auth.js',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
          '404': {
            description: 'Código de invitación no válido',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },
  },
}
