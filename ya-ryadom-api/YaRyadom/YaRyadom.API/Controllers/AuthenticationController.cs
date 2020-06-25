﻿using System;
using System.Net.Mime;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using YaRyadom.API.Models;
using YaRyadom.API.Models.Requests;
using YaRyadom.API.Services.Interfaces;

namespace YaRyadom.API.Controllers
{
	[Route("api/v{v:apiVersion}/auth")]
	[ApiController]
	public class AuthenticationController : ControllerBase
	{
		private readonly IMapper _mapper;
		private readonly IAuthenticationService _authenticationService;

		public AuthenticationController(IMapper mapper, IAuthenticationService authenticationService)
		{
			_mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
			_authenticationService = authenticationService ?? throw new ArgumentNullException(nameof(authenticationService));
		}

		[AllowAnonymous]
		[HttpGet("user-info/{vkUserId}")]
		[Consumes(MediaTypeNames.Application.Json)]
		[ProducesResponseType(StatusCodes.Status200OK)]
		public async Task<IActionResult> GetUserInfoByVkId(long vkUserId, CancellationToken cancellationToken = default)
		{
			var userInfoModel = await _authenticationService.GetUserByVkIdAsync(vkUserId, cancellationToken).ConfigureAwait(false);
			return Ok(userInfoModel);
		}

		[AllowAnonymous]
		[HttpPost("user-info/save")]
		[Consumes(MediaTypeNames.Application.Json)]
		[ProducesResponseType(StatusCodes.Status200OK)]
		public async Task<IActionResult> Save([FromBody] UserInfoModel model, CancellationToken cancellationToken = default)
		{
			await _authenticationService.SaveUserInfoAsync(model, cancellationToken).ConfigureAwait(false);
			return Ok(true);
		}

		[AllowAnonymous]
		[HttpPost("user-info/intro/save")]
		[Consumes(MediaTypeNames.Application.Json)]
		[ProducesResponseType(StatusCodes.Status200OK)]
		public async Task<IActionResult> SaveThemes([FromBody] UserIntroRequestModel model, CancellationToken cancellationToken = default)
		{
			await _authenticationService.SaveUserIntroAsync(model, cancellationToken).ConfigureAwait(false);
			return Ok(true);
		}
	}
}
