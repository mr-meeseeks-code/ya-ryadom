﻿using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using YaVDele.API.Services.Interfaces;
using YaVDele.Domain.DbContexts;
using YaVDele.Domain.Entities.Base;

namespace YaVDele.API.Services.Implementations
{
	public class BaseService<TEntity> : IBaseService<TEntity> where TEntity : class, IBaseEntity
	{
		protected readonly YaVDeleDbContext _dbContext;

		private DbSet<TEntity> _entities;

		public BaseService(YaVDeleDbContext dbContext)
		{
			if (dbContext == null) throw new ArgumentNullException(nameof(dbContext));
			_dbContext = dbContext;
		}

		protected virtual DbSet<TEntity> Entities => _entities ?? (_entities = _dbContext.Set<TEntity>());

		protected IQueryable<TEntity> TableNoTracking => Entities.AsNoTracking();

		protected IQueryable<TEntity> Query => Entities;

		public async Task<bool> AddAsync(TEntity entity, CancellationToken cancellationToken = default)
		{
			if (entity == null) throw new ArgumentNullException(nameof(entity));
			Entities.Add(entity);
			return await _dbContext.SaveChangesAsync(cancellationToken) > 0;
		}
	}
}
