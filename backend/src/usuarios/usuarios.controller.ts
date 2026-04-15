import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateUsuarioDto } from './dto/create.usuario.dto';

/**
 * Controlador de usuarios.
 * Todas las rutas requieren JWT y control de roles (RolesGuard).
 * La mayoría de operaciones están restringidas al rol 'admin',
 * salvo la actualización de perfil que puede realizar cualquier usuario autenticado.
 */
@UseGuards(JwtAuthGuard, RolesGuard) // aplica a todo el controller
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  /** GET /usuarios — Devuelve todos los usuarios. Solo accesible para admin. */
  @Roles('admin')
  @Get()
  findAll() {
    return this.usuariosService.findAll();
  }

  /** GET /usuarios/:id — Devuelve un usuario por su ID. Solo accesible para admin. */
  @Roles('admin')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.findOne(id);
  }

  /** POST /usuarios — Crea un nuevo usuario. Solo accesible para admin. */
  @Roles('admin')
  @Post()
  create(@Body() body: CreateUsuarioDto) {
    return this.usuariosService.create(body);
  }

  /** PATCH /usuarios/:id — Actualiza los datos de un usuario. Accesible para cualquier usuario autenticado. */
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Partial<CreateUsuarioDto>,
  ) {
    return this.usuariosService.update(id, body);
  }

  /** DELETE /usuarios/:id — Elimina un usuario por su ID. Solo accesible para admin. */
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.remove(id);
  }
}
