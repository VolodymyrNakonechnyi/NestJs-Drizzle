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
import { IdPersonDto } from './dto/id-person.dto';

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
	findOne(@Param() params: IdPersonDto) {
		return this.peopleService.findOne(params.id);
	}

	@Patch(':id')
	@HttpCode(HttpStatus.OK)
	update(
		@Param() params: IdPersonDto,
		@Body() updatePersonDto: UpdatePersonDto,
	) {
		return this.peopleService.update(params.id, updatePersonDto);
	}

	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	remove(@Param() params: IdPersonDto) {
		return this.peopleService.remove(params.id);
	}
}
