import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	HttpCode,
	HttpStatus,
} from '@nestjs/common';
import { PeopleService } from './people.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';

@Controller('people')
export class PeopleController {
	constructor(private readonly peopleService: PeopleService) {}

	@Post()
	@HttpCode(HttpStatus.CREATED)
	create(@Body() createPersonDto: CreatePersonDto) {
		return this.peopleService.create(createPersonDto);
	}

	@Get()
	@HttpCode(HttpStatus.OK)
	findAll() {
		return this.peopleService.findAll();
	}

	@Get(':id')
	@HttpCode(HttpStatus.OK)
	findOne(@Param('id') id: string) {
		return this.peopleService.findOne(+id);
	}

	@Patch(':id')
	@HttpCode(HttpStatus.OK)
	update(@Param('id') id: string, @Body() updatePersonDto: UpdatePersonDto) {
		return this.peopleService.update(+id, updatePersonDto);
	}

	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	remove(@Param('id') id: string) {
		return this.peopleService.remove(+id);
	}
}
