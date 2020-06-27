﻿using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Net.Mime;
using System.Threading;
using System.Threading.Tasks;
using YaRyadom.API.Helpers;
using YaRyadom.API.Models;
using YaRyadom.API.Models.Requests;
using YaRyadom.API.Services.Interfaces;

namespace YaRyadom.API.Controllers
{
	[Route("api/v{v:apiVersion}/my-events")]
	[ApiController]
	public class MyEventsController : ControllerBase
	{
		private readonly IMyEventsService _myEventsService;

		public MyEventsController(IMyEventsService myEventsService)
		{
			_myEventsService = myEventsService ?? throw new ArgumentNullException(nameof(myEventsService));
		}

		[AllowAnonymous]
		[HttpGet("{vkUserId}")]
		[Consumes(MediaTypeNames.Application.Json)]
		[ProducesResponseType(StatusCodes.Status200OK)]
		public async Task<IActionResult> GetMyEvents(long vkUserId, CancellationToken cancellationToken = default)
		{
			var result = await _myEventsService.GetAllMyEvents(vkUserId, cancellationToken).ConfigureAwait(false);
			return Ok(result);
		}

		[AllowAnonymous]
		[HttpPost("create")]
		[Consumes(MediaTypeNames.Application.Json)]
		[ProducesResponseType(StatusCodes.Status200OK)]
		public async Task<IActionResult> Create([FromBody] EventFormModel model, CancellationToken cancellationToken = default)
		{
			if (double.TryParse(Request.Headers[Header.TimeZone], out var minutes))
			{
				model.TimeZoneMinutes = minutes;
			}
			await _myEventsService.AddAsync(model, cancellationToken).ConfigureAwait(false);
			return Ok();
		}

		[AllowAnonymous]
		[HttpPost("revoke/{id}")]
		[Consumes(MediaTypeNames.Application.Json)]
		[ProducesResponseType(StatusCodes.Status200OK)]
		public async Task<IActionResult> Revoke(int id, CancellationToken cancellationToken = default)
		{
			await _myEventsService.RevokeAsync(id, cancellationToken).ConfigureAwait(false);
			return Ok();
		}


		[AllowAnonymous]
		[HttpPost("approve")]
		[Consumes(MediaTypeNames.Application.Json)]
		[ProducesResponseType(StatusCodes.Status200OK)]
		public async Task<IActionResult> ApproveApplication([FromBody] ApplicationRequestModel model, CancellationToken cancellationToken = default)
		{
			await _myEventsService.ApproveApplicationAsync(model, cancellationToken).ConfigureAwait(false);
			return Ok();
		}

		[AllowAnonymous]
		[HttpPost("reject")]
		[Consumes(MediaTypeNames.Application.Json)]
		[ProducesResponseType(StatusCodes.Status200OK)]
		public async Task<IActionResult> RejectApplication([FromBody] ApplicationRequestModel model, CancellationToken cancellationToken = default)
		{
			await _myEventsService.RejectApplicationAsync(model, cancellationToken).ConfigureAwait(false);
			return Ok();
		}
	}
}